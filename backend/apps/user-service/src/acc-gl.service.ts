import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ConnectionManagerService,
  GlAccountSchema,
  JournalEntrySchema,
  CostCenterSchema,
  AccountCategory,
  JournalSource,
} from '@tribyte/common';
import mongoose from 'mongoose';

@Injectable()
export class AccGlService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    await this.connectionManager.getTenantModel(tenantSlug, 'CostCenter', CostCenterSchema);
    const GlModel = await this.connectionManager.getTenantModel(tenantSlug, 'GlAccount', GlAccountSchema);
    const JournalModel = await this.connectionManager.getTenantModel(tenantSlug, 'JournalEntry', JournalEntrySchema);

    return { GlModel, JournalModel };
  }

  async createGlAccount(tenantSlug: string, data: any) {
    const { GlModel } = await this.getModels(tenantSlug);
    const existing = await GlModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`GL Account code '${data.code}' already exists`);
    }

    return GlModel.create({
      code: data.code.toUpperCase(),
      name: data.name,
      category: data.category,
      currentBalance: data.initialBalance || 0,
      costCenterId: data.costCenterId ? new mongoose.Types.ObjectId(data.costCenterId) : null,
    });
  }

  async findAllGlAccounts(tenantSlug: string) {
    const { GlModel } = await this.getModels(tenantSlug);

    const count = await GlModel.countDocuments();
    if (count === 0) {
      await GlModel.create([
        { code: '1010', name: 'Cash & Bank Balance', category: AccountCategory.ASSET, currentBalance: 50000 },
        { code: '1100', name: 'Accounts Receivable', category: AccountCategory.ASSET, currentBalance: 0 },
        { code: '2010', name: 'Accounts Payable', category: AccountCategory.LIABILITY, currentBalance: 0 },
        { code: '2100', name: 'Payroll Payable', category: AccountCategory.LIABILITY, currentBalance: 0 },
        { code: '3010', name: 'Owner Capital / Equity', category: AccountCategory.EQUITY, currentBalance: 50000 },
        { code: '4010', name: 'Sales & Service Revenue', category: AccountCategory.REVENUE, currentBalance: 0 },
        { code: '5010', name: 'Salaries & Wages Expense', category: AccountCategory.EXPENSE, currentBalance: 0 },
        { code: '5020', name: 'Office & Operating Expenses', category: AccountCategory.EXPENSE, currentBalance: 0 },
      ]);
    }

    return GlModel.find({ isActive: true }).populate('costCenterId', 'name code').sort({ code: 1 });
  }

  async createJournalEntry(tenantSlug: string, postedByUserId: string, data: any) {
    try {
      const { GlModel, JournalModel } = await this.getModels(tenantSlug);

      const lines = data.lines || [];
      if (lines.length < 2) {
        throw new BadRequestException('Journal entry must contain at least 2 lines (1 Debit, 1 Credit)');
      }

      let totalDebit = 0;
      let totalCredit = 0;

      const formattedLines = lines.map((line: any) => {
        const debitVal = parseFloat(line.debit) || 0;
        const creditVal = parseFloat(line.credit) || 0;

        totalDebit += debitVal;
        totalCredit += creditVal;

        return {
          glAccountId: new mongoose.Types.ObjectId(line.glAccountId),
          debit: debitVal,
          credit: creditVal,
          description: line.description,
        };
      });

      totalDebit = parseFloat(totalDebit.toFixed(2));
      totalCredit = parseFloat(totalCredit.toFixed(2));

      if (totalDebit !== totalCredit) {
        throw new BadRequestException(`Unbalanced journal entry! Total Debits (${totalDebit}) must equal Total Credits (${totalCredit})`);
      }

      const count = await JournalModel.countDocuments();
      const entryNumber = data.entryNumber || `JV-${1000 + count + 1}`;

      const entry = await JournalModel.create({
        entryNumber: entryNumber.toUpperCase(),
        entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
        description: data.description,
        reference: data.reference,
        source: data.source || JournalSource.MANUAL,
        lines: formattedLines,
        totalDebit,
        totalCredit,
        status: 'POSTED',
        postedByUserId: postedByUserId && mongoose.Types.ObjectId.isValid(postedByUserId) ? new mongoose.Types.ObjectId(postedByUserId) : null,
      });

      // Update Live GL Balances
      for (const line of formattedLines) {
        const glAccount = await GlModel.findById(line.glAccountId);
        if (glAccount) {
          if (glAccount.category === AccountCategory.ASSET || glAccount.category === AccountCategory.EXPENSE) {
            glAccount.currentBalance += line.debit - line.credit;
          } else {
            glAccount.currentBalance += line.credit - line.debit;
          }
          await glAccount.save();
        }
      }

      return entry;
    } catch (err: any) {
      console.error('AccGlService.createJournalEntry Error:', err);
      if (err instanceof BadRequestException || err instanceof ConflictException) throw err;
      throw new BadRequestException(err.message || 'Failed to post journal entry');
    }
  }

  async findAllJournalEntries(tenantSlug: string) {
    const { JournalModel } = await this.getModels(tenantSlug);

    return JournalModel.find()
      .populate('lines.glAccountId', 'code name category')
      .populate('postedByUserId', 'fullName email')
      .sort({ createdAt: -1 });
  }
}
