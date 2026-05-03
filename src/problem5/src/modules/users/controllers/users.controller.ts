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
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { BaseControllerInterface } from '../../../shares/controllers/base.interface.controller';
import { buildFindOptions } from '../../../shares/utilities/build-find-options';
import { UserQueryDto } from '@modules/users/dto/query-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController implements BaseControllerInterface<User> {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new user' })
	@ApiBody({
		type: CreateUserDto,
		examples: {
			valid: {
				summary: 'Valid payload',
				value: {
					first_name: 'John',
					last_name: 'Doe',
					email: 'john.doe@example.com',
					password: 'strongPassword123',
					role_id: '660e8400-e29b-41d4-a716-446655440000',
				},
			},
			missingEmail: {
				summary: 'Without email (optional)',
				value: {
					first_name: 'Jane',
					last_name: 'Doe',
					password: '123456',
					role_id: '660e8400-e29b-41d4-a716-446655440000',
				},
			},
		},
	})
	@ApiCreatedResponse({
		description: 'User created successfully',
		schema: {
			example: {
				id: '550e8400-e29b-41d4-a716-446655440000',
				first_name: 'John',
				last_name: 'Doe',
				name: 'John Doe',
				email: 'john.doe@example.com',
				role_id: '660e8400-e29b-41d4-a716-446655440000',
				role_name: 'admin',
				user_cards: [],
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T10:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		schema: {
			example: {
				statusCode: 400,
				message: [
					'email must be a valid email',
					'password must be longer than or equal to 6 characters',
					'role_id must be a UUID',
				],
				error: 'Bad Request',
			},
		},
	})
	create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all users' })

	// ===== WHERE =====
	@ApiQuery({
		name: 'where',
		required: false,
		style: 'deepObject',
		explode: true,
		schema: {
			type: 'object',
			additionalProperties: {
				type: 'object',
				additionalProperties: {
					type: 'string',
				},
			},
		},
		examples: {
			byName: {
				summary: 'Name contains "john"',
				value: {
					name: { contains: 'john' },
				},
			},
			byEmail: {
				summary: 'Exact email',
				value: {
					email: { equals: 'john@example.com' },
				},
			},
			byRole: {
				summary: 'Filter by role_id',
				value: {
					role_id: { equals: '660e8400-e29b-41d4-a716-446655440000' },
				},
			},
			dateRange: {
				summary: 'Created between two dates',
				value: {
					created_at: {
						gte: '2026-01-01T00:00:00.000Z',
						lte: '2026-12-31T23:59:59.999Z',
					},
				},
			},
			combined: {
				summary: 'Name + role',
				value: {
					name: { contains: 'john' },
					role_name: { equals: 'admin' },
				},
			},
		},
	})

	// ===== ORDER =====
	@ApiQuery({
		name: 'orderBy',
		required: false,
		style: 'deepObject',
		explode: true,
		schema: {
			type: 'object',
			additionalProperties: {
				type: 'string',
				enum: ['ASC', 'DESC'],
			},
		},
		examples: {
			createdDesc: {
				summary: 'Sort by created_at DESC',
				value: { created_at: 'DESC' },
			},
			nameAsc: {
				summary: 'Sort by name ASC',
				value: { name: 'ASC' },
			},
			multi: {
				summary: 'Multiple fields',
				value: {
					role_name: 'ASC',
					created_at: 'DESC',
				},
			},
		},
	})

	// ===== PAGINATION =====
	@ApiQuery({
		name: 'skip',
		required: false,
		example: 0,
		description: 'Number of records to skip',
	})
	@ApiQuery({
		name: 'take',
		required: false,
		example: 10,
		description: 'Number of records to take',
	})
	@ApiOkResponse({
		description: 'List users with total count',
		schema: {
			example: {
				items: [
					{
						id: '550e8400-e29b-41d4-a716-446655440000',
						first_name: 'John',
						last_name: 'Doe',
						name: 'John Doe',
						email: 'john@example.com',
						role_id: '660e8400-e29b-41d4-a716-446655440000',
						role_name: 'admin',
						user_cards: [],
						created_at: '2026-04-30T10:00:00.000Z',
						updated_at: '2026-04-30T10:00:00.000Z',
						deleted_at: null,
					},
				],
				count: 1,
			},
		},
	})
	findAll(@Query() query: UserQueryDto) {
		const options = buildFindOptions<User>(query, [
			'id',
			'first_name',
			'last_name',
			'name',
			'email',
			'role_id',
			'role_name',
			'created_at',
			'updated_at',
			'deleted_at',
		]);

		return this.usersService.findAllAndCount(options);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get user by ID' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '550e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiOkResponse({
		description: 'User found',
		schema: {
			example: {
				id: '550e8400-e29b-41d4-a716-446655440000',
				first_name: 'John',
				last_name: 'Doe',
				name: 'John Doe',
				email: 'john@example.com',
				role_id: '660e8400-e29b-41d4-a716-446655440000',
				role_name: 'admin',
				user_cards: [],
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T10:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'User not found',
		schema: {
			example: {
				statusCode: 404,
				message: 'User not found',
				error: 'Not Found',
			},
		},
	})
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.usersService.findOneById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update user by ID' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '550e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiBody({
		type: UpdateUserDto,
		examples: {
			updateName: {
				summary: 'Update name',
				value: {
					first_name: 'Jane',
					last_name: 'Smith',
				},
			},
			updateEmail: {
				summary: 'Update email',
				value: {
					email: 'jane.smith@example.com',
				},
			},
			updateRole: {
				summary: 'Change role',
				value: {
					role_id: '880e8400-e29b-41d4-a716-446655440000',
				},
			},
		},
	})
	@ApiOkResponse({
		description: 'User updated',
		schema: {
			example: {
				id: '550e8400-e29b-41d4-a716-446655440000',
				first_name: 'Jane',
				last_name: 'Smith',
				name: 'Jane Smith',
				email: 'jane.smith@example.com',
				role_id: '880e8400-e29b-41d4-a716-446655440000',
				role_name: 'manager',
				user_cards: [],
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T11:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Invalid data',
	})
	@ApiNotFoundResponse({
		description: 'User not found',
	})
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateUserDto,
	) {
		const res = await this.usersService.update(id, dto);
		if (!res) {
			throw new NotFoundException('User not found');
		}
		return this.findOne(id);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Soft delete user' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '550e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiResponse({
		status: 204,
		description: 'Deleted successfully',
	})
	@ApiNotFoundResponse({
		description: 'User not found',
	})
	async remove(@Param('id', ParseUUIDPipe) id: string) {
		const res = await this.usersService.softDeleteById(id);
		if (!res) {
			throw new NotFoundException('User not found');
		}
	}
}
