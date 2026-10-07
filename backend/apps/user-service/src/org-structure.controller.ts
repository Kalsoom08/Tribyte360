import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@tribyte/common';
import { OrgStructureService } from './org-structure.service';

@Controller()
export class OrgStructureMessageController {
  constructor(private readonly orgService: OrgStructureService) {}

  @MessagePattern(MessagePatterns.DEPARTMENT_CREATE)
  async handleCreateDept(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.orgService.createDepartment(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.DEPARTMENT_FIND_ALL)
  async handleFindDepts(@Payload() data: { tenantSlug: string }) {
    return this.orgService.findAllDepartments(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.DESIGNATION_CREATE)
  async handleCreateDesig(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.orgService.createDesignation(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.DESIGNATION_FIND_ALL)
  async handleFindDesigs(@Payload() data: { tenantSlug: string }) {
    return this.orgService.findAllDesignations(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.BRANCH_CREATE)
  async handleCreateBranch(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.orgService.createBranch(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.BRANCH_FIND_ALL)
  async handleFindBranches(@Payload() data: { tenantSlug: string }) {
    return this.orgService.findAllBranches(data.tenantSlug);
  }

  @MessagePattern(MessagePatterns.COST_CENTER_CREATE)
  async handleCreateCostCenter(@Payload() data: { tenantSlug: string; payload: any }) {
    return this.orgService.createCostCenter(data.tenantSlug, data.payload);
  }

  @MessagePattern(MessagePatterns.COST_CENTER_FIND_ALL)
  async handleFindCostCenters(@Payload() data: { tenantSlug: string }) {
    return this.orgService.findAllCostCenters(data.tenantSlug);
  }
}
