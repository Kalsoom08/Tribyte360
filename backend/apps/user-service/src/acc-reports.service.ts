import { Injectable, ConflictException } from '@nestjs/common';
import {
  ConnectionManagerService,
  TaxConfigSchema,
  AccountCategory,
} from '@tribyte/common';
import { AccGlService } from './acc-gl.service';

@Injectable()
export class AccReportsService {
  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly glService: AccGlService,
  ) {}

  private async getTaxModel(tenantSlug: string) {
    return this.connectionManager.getTenantModel(tenantSlug, 'TaxConfig', TaxConfigSchema);
  }

  // Tax Configuration
  async createTax(tenantSlug: string, data: any) {
    const TaxModel = await this.getTaxModel(tenantSlug);
    const existing = await TaxModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Tax code '${data.code}' already exists`);
    }

    return TaxModel.create({
      name: data.name,
      code: data.code.toUpperCase(),
      ratePercentage: data.ratePercentage || 0,
      isWithholding: data.isWithholding || false,
    });
  }

  async findAllTaxes(tenantSlug: string) {
    const TaxModel = await this.getTaxModel(tenantSlug);

    const count = await TaxModel.countDocuments();
    if (count === 0) {
      await TaxModel.create([
        { name: 'Standard Sales VAT 10%', code: 'VAT_10', ratePercentage: 10, isWithholding: false },
        { name: 'Vendor Withholding Tax 5%', code: 'WHT_5', ratePercentage: 5, isWithholding: true },
      ]);
    }

    return TaxModel.find({ isActive: true }).sort({ name: 1 });
  }

  // Profit & Loss (P&L) Statement
  async getProfitLossReport(tenantSlug: string) {
    const glAccounts = await this.glService.findAllGlAccounts(tenantSlug);

    const revenueAccounts = glAccounts.filter((a) => a.category === AccountCategory.REVENUE);
    const expenseAccounts = glAccounts.filter((a) => a.category === AccountCategory.EXPENSE);

    const totalRevenue = revenueAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);
    const totalExpenses = expenseAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);
    const netIncome = parseFloat((totalRevenue - totalExpenses).toFixed(2));

    return {
      statement: 'PROFIT_AND_LOSS',
      tenantSlug,
      period: 'Fiscal Year To Date',
      summary: {
        totalRevenueUSD: totalRevenue,
        totalExpensesUSD: totalExpenses,
        netIncomeUSD: netIncome,
        isProfitable: netIncome >= 0,
      },
      revenueBreakdown: revenueAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.currentBalance })),
      expenseBreakdown: expenseAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.currentBalance })),
    };
  }

  // Balance Sheet Statement (Assets = Liabilities + Equity)
  async getBalanceSheetReport(tenantSlug: string) {
    const glAccounts = await this.glService.findAllGlAccounts(tenantSlug);

    const assetAccounts = glAccounts.filter((a) => a.category === AccountCategory.ASSET);
    const liabilityAccounts = glAccounts.filter((a) => a.category === AccountCategory.LIABILITY);
    const equityAccounts = glAccounts.filter((a) => a.category === AccountCategory.EQUITY);

    const totalAssets = assetAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);
    const totalLiabilities = liabilityAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);
    const totalEquity = equityAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);

    const totalLiabilitiesAndEquity = parseFloat((totalLiabilities + totalEquity).toFixed(2));

    return {
      statement: 'BALANCE_SHEET',
      tenantSlug,
      asOfDate: new Date().toISOString().split('T')[0],
      summary: {
        totalAssetsUSD: totalAssets,
        totalLiabilitiesUSD: totalLiabilities,
        totalEquityUSD: totalEquity,
        totalLiabilitiesAndEquityUSD: totalLiabilitiesAndEquity,
        isBalanced: totalAssets === totalLiabilitiesAndEquity,
      },
      assets: assetAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.currentBalance })),
      liabilities: liabilityAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.currentBalance })),
      equity: equityAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.currentBalance })),
    };
  }
}
