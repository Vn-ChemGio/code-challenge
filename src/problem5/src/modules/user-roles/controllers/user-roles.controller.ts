import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';

import { UserRolesService } from '../services/user-roles.service';
import { CreateUserRoleDto } from '../dto/create-user-role.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UserRole } from '../entities/user-role.entity';
import { BaseControllerInterface } from '../../../shares/controllers/base.interface.controller';
import { UserRoleQueryDto } from '@modules/user-roles/dto/query-user-role.dto';
import { buildFindOptions } from '../../../shares/utilities/build-find-options';
import { FindManyOptions } from 'typeorm';

@ApiTags('User Roles')
@Controller('user-roles')
export class UserRolesController implements BaseControllerInterface<UserRole> {
	constructor(private readonly userRolesService: UserRolesService) {}

	@Post()
	@ApiOperation({ summary: 'Create role' })
	@ApiBody({
		type: CreateUserRoleDto,
		examples: {
			admin: {
				summary: 'Admin role',
				value: {
					name: 'admin',
					description: 'Administrator role',
				},
			},
			user: {
				summary: 'User role',
				value: {
					name: 'user',
					description: 'Normal user role',
				},
			},
		},
	})
	@ApiCreatedResponse({
		description: 'Role created',
		schema: {
			example: {
				id: '660e8400-e29b-41d4-a716-446655440000',
				name: 'admin',
				description: 'Administrator role',
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T10:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Validation failed or duplicate role',
		schema: {
			example: {
				statusCode: 400,
				message: ['name must be longer than or equal to 2 characters'],
				error: 'Bad Request',
			},
		},
	})
	create(@Body() dto: CreateUserRoleDto) {
		return this.userRolesService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all roles' })

	// ===== WHERE =====
	@ApiQuery({
		name: 'where',
		required: false,
		description: 'Filter (JSON string, Prisma-like)',
		examples: {
			simple: {
				summary: 'Filter by name',
				value: JSON.stringify({
					name: { contains: 'admin' },
				}),
			},
			and: {
				summary: 'AND condition',
				value: JSON.stringify({
					AND: [
						{ name: { contains: 'admin' } },
						{ description: { contains: 'role' } },
					],
				}),
			},
			or: {
				summary: 'OR condition',
				value: JSON.stringify({
					OR: [{ name: { eq: 'admin' } }, { name: { eq: 'user' } }],
				}),
			},
		},
	})

	// ===== ORDER =====
	@ApiQuery({
		name: 'orderBy',
		required: false,
		description: 'Sort fields',
		examples: {
			desc: {
				summary: 'Sort newest first',
				value: JSON.stringify({ created_at: 'DESC' }),
			},
			multi: {
				summary: 'Multi sort',
				value: JSON.stringify({
					created_at: 'DESC',
					name: 'ASC',
				}),
			},
		},
	})

	// ===== PAGINATION =====
	@ApiQuery({
		name: 'skip',
		required: false,
		example: 0,
	})
	@ApiQuery({
		name: 'take',
		required: false,
		example: 10,
	})
	@ApiOkResponse({
		description: 'List roles',
		schema: {
			example: {
				items: [
					{
						id: '660e8400-e29b-41d4-a716-446655440000',
						name: 'admin',
						description: 'Administrator role',
						created_at: '2026-04-30T10:00:00.000Z',
						updated_at: '2026-04-30T10:00:00.000Z',
						deleted_at: null,
					},
				],
				count: 1,
			},
		},
	})
	findAll(@Query() query: UserRoleQueryDto) {
		const options = buildFindOptions(query, [
			'id',
			'name',
			'description',
			'created_at',
			'updated_at',
			'deleted_at',
		]);

		return this.userRolesService.findAllAndCount(options);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get role by ID' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '660e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiOkResponse({
		description: 'Role found',
		schema: {
			example: {
				id: '660e8400-e29b-41d4-a716-446655440000',
				name: 'admin',
				description: 'Administrator role',
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T10:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Role not found',
		schema: {
			example: {
				statusCode: 404,
				message: 'Role not found',
				error: 'Not Found',
			},
		},
	})
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.userRolesService.findOneById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update role' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '660e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiBody({
		type: UpdateUserRoleDto,
		examples: {
			updateName: {
				summary: 'Update role name',
				value: {
					name: 'manager',
				},
			},
			updateDesc: {
				summary: 'Update description',
				value: {
					description: 'Manager role',
				},
			},
		},
	})
	@ApiOkResponse({
		description: 'Role updated',
		schema: {
			example: {
				id: '660e8400-e29b-41d4-a716-446655440000',
				name: 'manager',
				description: 'Manager role',
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T11:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Role not found',
	})
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateUserRoleDto,
	) {
		const res = await this.userRolesService.update(id, dto);
		if (!res) throw new NotFoundException('Role not found');
		return this.findOne(id);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete role' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '660e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiResponse({
		status: 204,
		description: 'Deleted successfully',
	})
	@ApiNotFoundResponse({
		description: 'Role not found',
	})
	async remove(@Param('id', ParseUUIDPipe) id: string) {
		const res = await this.userRolesService.remove(id);
		if (!res) throw new NotFoundException('Role not found');
	}
}
