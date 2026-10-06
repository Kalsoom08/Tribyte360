import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsMessageController {
  constructor(private readonly settingsService: SettingsService) {}

  @MessagePattern(MessagePatterns.SETTINGS_GET)
  async handleGetSettings() {
    return this.settingsService.getSettings();
  }

  @MessagePattern(MessagePatterns.SETTINGS_UPDATE)
  async handleUpdateSettings(@Payload() data: { updateData: any }) {
    return this.settingsService.updateSettings(data.updateData);
  }
}
