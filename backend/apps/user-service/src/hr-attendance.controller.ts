import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { HrAttendanceService } from './hr-attendance.service';

@Controller()
export class HrAttendanceMessageController {
  constructor(private readonly attendanceService: HrAttendanceService) {}

  @MessagePattern(MessagePatterns.HR_SHIFT_CREATE)
  async handleCreateShift(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.attendanceService.createShift(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.HR_SHIFT_FIND_ALL)
  async handleFindShifts(@Payload() data: { tenantSlug: string }) {
    return this.attendanceService.findAllShifts(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.HR_ATTENDANCE_CLOCK_IN)
  async handleClockIn(@Payload() data: { tenantSlug: string; userId: string; ipAddress?: string }) {
    return this.attendanceService.clockIn(data.tenantSlug, data.userId, data.ipAddress);
  }

  @MessagePattern(MessagePatterns.HR_ATTENDANCE_CLOCK_OUT)
  async handleClockOut(@Payload() data: { tenantSlug: string; userId: string; ipAddress?: string }) {
    return this.attendanceService.clockOut(data.tenantSlug, data.userId, data.ipAddress);
  }

  @MessagePattern(MessagePatterns.HR_ATTENDANCE_FIND_ALL)
  async handleFindAttendance(@Payload() data: { tenantSlug: string; date?: string }) {
    return this.attendanceService.findAllAttendance(data.tenantSlug, data.date);
  }
}
