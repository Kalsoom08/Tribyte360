import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule, AppLoggerService, ConnectionManagerService, I18nService } from '@tribyte/common';
import { UserMessageController } from './user.controller';
import { TenantAuthMessageController } from './tenant-auth.controller';
import { CompanyProfileMessageController } from './company-profile.controller';
import { OrgStructureMessageController } from './org-structure.controller';
import { TenantUserMgmtMessageController } from './tenant-user-mgmt.controller';
import { CompanyPolicyMessageController } from './company-policy.controller';
import { CompanyReportsMessageController } from './company-reports.controller';
import { HrEmployeeMessageController } from './hr-employee.controller';
import { HrAttendanceMessageController } from './hr-attendance.controller';
import { HrLeaveMessageController } from './hr-leave.controller';
import { HrPayrollMessageController } from './hr-payroll.controller';
import { HrPerformanceMessageController } from './hr-performance.controller';
import { TenantAuthService } from './tenant-auth.service';
import { CompanyProfileService } from './company-profile.service';
import { OrgStructureService } from './org-structure.service';
import { TenantUserMgmtService } from './tenant-user-mgmt.service';
import { CompanyPolicyService } from './company-policy.service';
import { CompanyReportsService } from './company-reports.service';
import { HrEmployeeService } from './hr-employee.service';
import { HrAttendanceService } from './hr-attendance.service';
import { HrLeaveService } from './hr-leave.service';
import { HrPayrollService } from './hr-payroll.service';
import { HrPerformanceService } from './hr-performance.service';

@Module({
  imports: [
    AppConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    UserMessageController,
    TenantAuthMessageController,
    CompanyProfileMessageController,
    OrgStructureMessageController,
    TenantUserMgmtMessageController,
    CompanyPolicyMessageController,
    CompanyReportsMessageController,
    HrEmployeeMessageController,
    HrAttendanceMessageController,
    HrLeaveMessageController,
    HrPayrollMessageController,
    HrPerformanceMessageController,
  ],
  providers: [
    AppLoggerService,
    ConnectionManagerService,
    I18nService,
    TenantAuthService,
    CompanyProfileService,
    OrgStructureService,
    TenantUserMgmtService,
    CompanyPolicyService,
    CompanyReportsService,
    HrEmployeeService,
    HrAttendanceService,
    HrLeaveService,
    HrPayrollService,
    HrPerformanceService,
  ],
})
export class AppModule {}
