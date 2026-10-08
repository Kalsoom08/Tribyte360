import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ConnectionManagerService,
  SupplierBillSchema,
  ExpenseClaimSchema,
  TenantUserSchema,
  ExpenseStatus,
} from '@tribyte/common';

@Injectable()
export class AccPayableService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    const BillModel = await this.connectionManager.getTenantModel(tenantSlug, 'SupplierBill', SupplierBillSchema);
    const ExpenseModel = await this.connectionManager.getTenantModel(tenantSlug, 'ExpenseClaim', ExpenseClaimSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'User', TenantUserSchema);

    return { BillModel, ExpenseModel };
  }

  // Supplier Bills (Accounts Payable)
  async createBill(tenantSlug: string, data: any) {
    const { BillModel } = await this.getModels(tenantSlug);

    const count = await BillModel.countDocuments();
    const billNumber = data.billNumber || `BILL-2026-${100 + count + 1}`;

    const items = (data.items || []).map((item: any) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.unitPrice || 0);
      return {
        description: item.description,
        quantity: qty,
        unitPrice: price,
        totalAmount: parseFloat((qty * price).toFixed(2)),
      };
    });

    const totalAmount = items.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);

    return BillModel.create({
      billNumber: billNumber.toUpperCase(),
      vendorName: data.vendorName,
      vendorEmail: data.vendorEmail,
      billDate: data.billDate ? new Date(data.billDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items,
      totalAmount,
      amountPaid: 0,
      status: 'UNPAID',
    });
  }

  async findAllBills(tenantSlug: string) {
    const { BillModel } = await this.getModels(tenantSlug);
    const bills = await BillModel.find().sort({ createdAt: -1 });

    const totalPayables = bills.reduce((acc, curr) => acc + (curr.totalAmount - curr.amountPaid), 0);

    return {
      stats: {
        totalBills: bills.length,
        totalPayables: parseFloat(totalPayables.toFixed(2)),
      },
      bills,
    };
  }

  // Employee Expense Reimbursements
  async createExpenseClaim(tenantSlug: string, employeeUserId: string, data: any) {
    const { ExpenseModel } = await this.getModels(tenantSlug);

    const count = await ExpenseModel.countDocuments();
    const claimNumber = data.claimNumber || `EXP-${1000 + count + 1}`;

    return ExpenseModel.create({
      claimNumber: claimNumber.toUpperCase(),
      employeeUserId,
      category: data.category || 'OFFICE_SUPPLIES',
      amount: Number(data.amount || 0),
      description: data.description,
      receiptUrl: data.receiptUrl,
      status: ExpenseStatus.PENDING,
    });
  }

  async findAllExpenseClaims(tenantSlug: string) {
    const { ExpenseModel } = await this.getModels(tenantSlug);

    const claims = await ExpenseModel.find()
      .populate('employeeUserId', 'fullName email departmentId')
      .populate('approvedByUserId', 'fullName email')
      .sort({ createdAt: -1 });

    const totalClaimAmount = claims.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      stats: {
        totalClaims: claims.length,
        pendingCount: claims.filter((c) => c.status === ExpenseStatus.PENDING).length,
        approvedCount: claims.filter((c) => c.status === ExpenseStatus.APPROVED || c.status === ExpenseStatus.REIMBURSED).length,
        totalClaimAmount: parseFloat(totalClaimAmount.toFixed(2)),
      },
      expenseClaims: claims,
    };
  }

  async approveExpenseClaim(tenantSlug: string, claimId: string, approverUserId: string, status: ExpenseStatus, rejectionReason?: string) {
    const { ExpenseModel } = await this.getModels(tenantSlug);

    const claim = await ExpenseModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Expense claim not found');
    }

    claim.status = status;
    claim.approvedByUserId = approverUserId;
    if (status === ExpenseStatus.REJECTED && rejectionReason) {
      claim.rejectionReason = rejectionReason;
    }

    await claim.save();
    return claim;
  }
}
