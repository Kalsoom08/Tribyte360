import { Injectable } from '@nestjs/common';
import { ConnectionManagerService, AppSettingsSchema } from '@tribyte/common';

@Injectable()
export class SettingsService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getSettingsModel() {
    const conn = await this.connectionManager.getSuperDatabaseConnection();
    return conn.models['AppSettings'] || conn.model('AppSettings', AppSettingsSchema);
  }

  async getSettings() {
    const SettingsModel = await this.getSettingsModel();
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = await SettingsModel.create({
        appName: 'Tribyte360 ERP',
        defaultLanguage: 'en',
        maintenanceMode: false,
        supportEmail: 'support@tribyte360.com',
      });
    }
    return settings;
  }

  async updateSettings(updateData: any) {
    const SettingsModel = await this.getSettingsModel();
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = await SettingsModel.create(updateData);
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }
    return settings;
  }
}
