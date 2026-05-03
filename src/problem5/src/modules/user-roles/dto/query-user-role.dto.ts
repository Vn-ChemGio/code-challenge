import { createQueryDto } from '../../../shares/utilities/build-find-options';
import { UserRole } from '../entities/user-role.entity';

export class UserRoleQueryDto extends createQueryDto<UserRole>(UserRole) {}
