import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyProfileDocument = CompanyProfile & Document;

@Schema({ _id: false })
export class Address {
  @Prop() street?: string;
  @Prop() city?: string;
  @Prop() state?: string;
  @Prop() zipCode?: string;
  @Prop({ default: 'United States' }) country?: string;
}

@Schema({ timestamps: true })
export class CompanyProfile {
  @Prop({ required: true })
  name: string;

  @Prop()
  logoUrl?: string;

  @Prop({ type: Address })
  address?: Address;

  @Prop()
  taxId?: string;

  @Prop({ type: [String], default: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] })
  workingDays: string[];

  @Prop({ default: '09:00' })
  workStartTime: string;

  @Prop({ default: '17:00' })
  workEndTime: string;

  @Prop({ default: 'January' })
  fiscalYearStartMonth: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ default: 'en' })
  defaultLanguage: string;
}

export const CompanyProfileSchema = SchemaFactory.createForClass(CompanyProfile);
