import { Injectable, NotFoundException } from '@nestjs/common';
import { ConnectionManagerService, CompanyProfileSchema } from '@tribyte/common';

@Injectable()
export class CompanyProfileService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getProfileModel(tenantSlug: string) {
    return this.connectionManager.getTenantModel(
      tenantSlug,
      'CompanyProfile',
      CompanyProfileSchema,
    );
  }

  async getProfile(tenantSlug: string) {
    const ProfileModel = await this.getProfileModel(tenantSlug);
    let profile = await ProfileModel.findOne();

    if (!profile) {
      // Auto-initialize profile with tenant defaults if first access
      profile = await ProfileModel.create({
        name: tenantSlug.toUpperCase() + ' Company',
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        workStartTime: '09:00',
        workEndTime: '17:00',
        fiscalYearStartMonth: 'January',
        timezone: 'UTC',
        defaultLanguage: 'en',
      });
    }

    return profile;
  }

  async updateProfile(tenantSlug: string, updateData: any) {
    const ProfileModel = await this.getProfileModel(tenantSlug);
    let profile = await ProfileModel.findOne();

    if (!profile) {
      profile = await ProfileModel.create({ ...updateData, name: updateData.name || tenantSlug.toUpperCase() });
    } else {
      Object.assign(profile, updateData);
      await profile.save();
    }

    return profile;
  }
}
