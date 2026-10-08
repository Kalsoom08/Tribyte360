import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ConnectionManagerService,
  ShiftSchema,
  AttendanceLogSchema,
  AttendanceStatus,
  TenantUserSchema,
} from '@tribyte/common';

@Injectable()
export class HrAttendanceService {
  constructor(private readonly connectionManager: ConnectionManagerService) {}

  private async getModels(tenantSlug: string) {
    const ShiftModel = await this.connectionManager.getTenantModel(tenantSlug, 'Shift', ShiftSchema);
    const AttendanceModel = await this.connectionManager.getTenantModel(tenantSlug, 'AttendanceLog', AttendanceLogSchema);
    await this.connectionManager.getTenantModel(tenantSlug, 'User', TenantUserSchema);

    return { ShiftModel, AttendanceModel };
  }

  async createShift(tenantSlug: string, data: any) {
    const { ShiftModel } = await this.getModels(tenantSlug);
    const existing = await ShiftModel.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ConflictException(`Shift code '${data.code}' already exists`);
    }

    return ShiftModel.create({
      name: data.name,
      code: data.code.toUpperCase(),
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '17:00',
      breakDurationMinutes: data.breakDurationMinutes || 60,
      gracePeriodMinutes: data.gracePeriodMinutes || 15,
    });
  }

  async findAllShifts(tenantSlug: string) {
    const { ShiftModel } = await this.getModels(tenantSlug);

    const count = await ShiftModel.countDocuments();
    if (count === 0) {
      await ShiftModel.create({
        name: 'Standard Day Shift',
        code: 'DAY_STD',
        startTime: '09:00',
        endTime: '17:00',
        breakDurationMinutes: 60,
        gracePeriodMinutes: 15,
      });
    }

    return ShiftModel.find({ isActive: true }).sort({ name: 1 });
  }

  async clockIn(tenantSlug: string, userId: string, ipAddress?: string) {
    const { AttendanceModel, ShiftModel } = await this.getModels(tenantSlug);
    const today = new Date().toISOString().split('T')[0];

    const existingLog = await AttendanceModel.findOne({ userId, date: today });
    if (existingLog && existingLog.clockInTime) {
      throw new BadRequestException('Employee has already clocked in for today');
    }

    const defaultShift = await ShiftModel.findOne({ isActive: true });
    const now = new Date();

    let lateMinutes = 0;
    let status = AttendanceStatus.PRESENT;

    if (defaultShift) {
      const [shiftHour, shiftMinute] = defaultShift.startTime.split(':').map(Number);
      const shiftStartTime = new Date(now);
      shiftStartTime.setHours(shiftHour, shiftMinute, 0, 0);

      const graceTime = new Date(shiftStartTime.getTime() + defaultShift.gracePeriodMinutes * 60000);
      if (now > graceTime) {
        lateMinutes = Math.floor((now.getTime() - shiftStartTime.getTime()) / 60000);
        status = AttendanceStatus.LATE;
      }
    }

    const log = await AttendanceModel.create({
      userId,
      shiftId: defaultShift?._id,
      date: today,
      clockInTime: now,
      clockInIp: ipAddress,
      status,
      lateMinutes,
    });

    return { message: 'Clocked in successfully', attendance: log };
  }

  async clockOut(tenantSlug: string, userId: string, ipAddress?: string) {
    const { AttendanceModel } = await this.getModels(tenantSlug);
    const today = new Date().toISOString().split('T')[0];

    const log = await AttendanceModel.findOne({ userId, date: today });
    if (!log || !log.clockInTime) {
      throw new BadRequestException('Employee must clock in before clocking out');
    }

    if (log.clockOutTime) {
      throw new BadRequestException('Employee has already clocked out for today');
    }

    const now = new Date();
    log.clockOutTime = now;
    log.clockOutIp = ipAddress;

    const totalHours = (now.getTime() - log.clockInTime.getTime()) / (1000 * 3600);
    if (totalHours > 8) {
      log.overtimeHours = parseFloat((totalHours - 8).toFixed(2));
    }

    await log.save();
    return { message: 'Clocked out successfully', totalHoursWorked: parseFloat(totalHours.toFixed(2)), attendance: log };
  }

  async findAllAttendance(tenantSlug: string, date?: string) {
    const { AttendanceModel } = await this.getModels(tenantSlug);
    const queryDate = date || new Date().toISOString().split('T')[0];

    const logs = await AttendanceModel.find({ date: queryDate })
      .populate('userId', 'fullName email departmentId')
      .populate('shiftId', 'name code startTime endTime')
      .sort({ clockInTime: -1 });

    const stats = {
      date: queryDate,
      totalLogs: logs.length,
      presentCount: logs.filter((l) => l.status === AttendanceStatus.PRESENT).length,
      lateCount: logs.filter((l) => l.status === AttendanceStatus.LATE).length,
      totalOvertimeHours: logs.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0),
    };

    return { stats, attendanceLogs: logs };
  }
}
