import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { HrEmployeeService } from './hr-employee.service';

@Controller()
export class HrEmployeeMessageController {
  constructor(private readonly hrService: HrEmployeeService) {}

  @MessagePattern(MessagePatterns.HR_EMPLOYEE_CREATE)
  async handleCreate(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.hrService.createEmployee(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.HR_EMPLOYEE_FIND_ALL)
  async handleFindAll(@Payload() data: { tenantSlug: string }) {
    return this.hrService.findAllEmployees(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.HR_EMPLOYEE_GET_BY_ID)
  async handleGetById(@Payload() data: { tenantSlug: string; id: string }) {
    return this.hrService.findEmployeeById(data.tenantSlug, data.id);
  }

  @MessagePattern(MessagePatterns.HR_EMPLOYEE_UPDATE_STATUS)
  async handleUpdateStatus(@Payload() data: { tenantSlug: string; id: string; status: any; exitReason?: string }) {
    return this.hrService.updateEmploymentStatus(data.tenantSlug, data.id, data.status, data.exitReason);
  }
}
