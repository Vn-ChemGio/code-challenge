import { OmitType } from '@nestjs/swagger';
import { UserRole } from '../entities/user-role.entity';

export class CreateUserRoleDto extends OmitType(UserRole, [
	'id',
	'created_at',
	'updated_at',
	'deleted_at',
]) {}
