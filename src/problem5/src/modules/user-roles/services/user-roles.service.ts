import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/user-role.entity';
import { BaseServiceAbstract } from '../../../shares/services/base.abstract.service';
import { CreateUserRoleDto } from '../dto/create-user-role.dto';

@Injectable()
export class UserRolesService extends BaseServiceAbstract<UserRole> {
	constructor(
		@Inject(getRepositoryToken(UserRole))
		private readonly userRolesRepository: Repository<UserRole>,
	) {
		super(userRolesRepository);
	}

	async create(dto: CreateUserRoleDto): Promise<UserRole> {
		if (
			!(await this.userRolesRepository.exists({
				where: {
					name: dto.name,
				},
			}))
		) {
			throw new ConflictException('Role already exists');
		}
		return super.create(dto);
	}
}
