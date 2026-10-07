import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyPolicyDocument = CompanyPolicy & Document;

@Schema({ _id: false })
export class LeavePolicy {
  @Prop({ default: 18 }) annualLeaveDays: number;
  @Prop({ default: 10 }) sickLeaveDays: number;
  @Prop({ default: 5 }) carryForwardMaxDays: number;
  @Prop({ default: true }) requiresApproval: boolean;
}

@Schema({ _id: false })
export class AttendancePolicy {
  @Prop({ default: 15 }) gracePeriodMinutes: number;
  @Prop({ default: 4 }) halfDayThresholdHours: number;
  @Prop({ default: 8 }) fullDayThresholdHours: number;
  @Prop({ default: true }) allowMobileClockIn: boolean;
}

@Schema({ _id: false })
export class OvertimePolicy {
  @Prop({ default: 1.5 }) rateMultiplier: number; // e.g. 1.5x regular pay
  @Prop({ default: 40 }) maxMonthlyHours: number;
  @Prop({ default: true }) requiresApproval: boolean;
}

@Schema({ _id: false })
export class SalaryPolicy {
  @Prop({ default: 'MONTHLY' }) payrollFrequency: string; // MONTHLY, BI_WEEKLY
  @Prop({ default: 'USD' }) currency: string;
  @Prop({ default: true }) autoCalculateTaxes: boolean;
}

@Schema({ _id: false })
export class ExpensePolicy {
  @Prop({ default: 100 }) maxNoApprovalAmount: number;
  @Prop({ default: 25 }) receiptRequiredThreshold: number;
  @Prop({ default: true }) requiresReceiptUpload: boolean;
}

@Schema({ timestamps: true })
export class CompanyPolicy {
  @Prop({ type: LeavePolicy, default: () => ({}) }) leavePolicy: LeavePolicy;
  @Prop({ type: AttendancePolicy, default: () => ({}) }) attendancePolicy: AttendancePolicy;
  @Prop({ type: OvertimePolicy, default: () => ({}) }) overtimePolicy: OvertimePolicy;
  @Prop({ type: SalaryPolicy, default: () => ({}) }) salaryPolicy: SalaryPolicy;
  @Prop({ type: ExpensePolicy, default: () => ({}) }) expensePolicy: ExpensePolicy;
}

export const CompanyPolicySchema = SchemaFactory.createForClass(CompanyPolicy);
