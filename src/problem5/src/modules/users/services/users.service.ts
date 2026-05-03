import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserRolesService } from '@modules/user-roles/services/user-roles.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { BaseServiceAbstract } from '../../../shares/services/base.abstract.service';

@Injectable()
export class UsersService extends BaseServiceAbstract<User> {
	constructor(
		@Inject(getRepositoryToken(User))
		private readonly usersRepository: Repository<User>,
		private readonly userRolesService: UserRolesService,
	) {
		super(usersRepository);
	}

	async create(dto: CreateUserDto): Promise<User> {
		await Promise.all([
			(async () => {
				if (
					!(await this.userRolesService.exists({ where: { id: dto.role_id } }))
				) {
					throw new BadRequestException(`Role doesn't exists`);
				}
			})(),
			(async () => {
				if (
					await this.usersRepository.exists({ where: { email: dto.email } })
				) {
					throw new ConflictException(`Email already exist`);
				}
			})(),
		]);
		return super.create(dto);
	}

	async update(id: string, dto: UpdateUserDto): Promise<number> {
		await Promise.all([
			(async () => {
				if (
					dto.role_id &&
					!(await this.userRolesService.exists({ where: { id: dto.role_id } }))
				) {
					throw new BadRequestException(`Role doesn't exists`);
				}
			})(),
			(async () => {
				if (
					await this.usersRepository.exists({
						where: { email: dto.email, id: Not(id) },
					})
				) {
					throw new ConflictException(`Email already exist`);
				}
			})(),
		]);
		return super.update(id, dto);
	}
}
