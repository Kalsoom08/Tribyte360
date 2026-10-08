import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { AccGlService } from './acc-gl.service';

@Controller()
export class AccGlMessageController {
  constructor(private readonly glService: AccGlService) {}

  @MessagePattern(MessagePatterns.ACC_GL_ACCOUNT_CREATE)
  async handleCreateGlAccount(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.glService.createGlAccount(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.ACC_GL_ACCOUNT_FIND_ALL)
  async handleFindGlAccounts(@Payload() data: { tenantSlug: string }) {
    return this.glService.findAllGlAccounts(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.ACC_JOURNAL_ENTRY_CREATE)
  async handleCreateJournalEntry(@Payload() data: { tenantSlug: string; postedByUserId: string; payload: any }) {
    return this.glService.createJournalEntry(data.tenantSlug, data.postedByUserId, data.payload);
  }

  @MessagePattern(MessagePatterns.ACC_JOURNAL_ENTRY_FIND_ALL)
  async handleFindJournalEntries(@Payload() data: { tenantSlug: string }) {
    return this.glService.findAllJournalEntries(data.tenantSlug);
  }
}
