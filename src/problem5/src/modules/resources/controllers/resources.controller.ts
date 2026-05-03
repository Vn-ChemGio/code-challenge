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

import { ResourcesService } from '../services/resources.service';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { ResourceQueryDto } from '../dto/query-resource.dto';
import { buildFindOptions } from '../../../shares/utilities/build-find-options';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
	constructor(private readonly resourcesService: ResourcesService) {}

	@Post()
	@ApiOperation({ summary: 'Create resource' })
	@ApiBody({
		type: CreateResourceDto,
		examples: {
			image: {
				summary: 'Upload image resource',
				value: {
					url: 'https://cdn.example.com/uploads/avatar.png',
					name: 'avatar.png',
					type: 'image/png',
					size: 204800,
					description: 'User avatar image',
				},
			},
		},
	})
	@ApiCreatedResponse({
		description: 'Resource created successfully',
		schema: {
			example: {
				id: '550e8400-e29b-41d4-a716-446655440000',
				url: 'https://cdn.example.com/uploads/avatar.png',
				name: 'avatar.png',
				type: 'image/png',
				size: 204800,
				description: 'User avatar image',
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
				message: ['url must be a valid URL'],
				error: 'Bad Request',
			},
		},
	})
	create(@Body() dto: CreateResourceDto) {
		return this.resourcesService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all resources' })

	// ================= WHERE =================
	@ApiQuery({
		name: 'where',
		required: false,
		description: 'Prisma-like filter (JSON string)',
		examples: {
			byType: {
				summary: 'Filter by type',
				value: JSON.stringify({
					type: { eq: 'image/png' },
				}),
			},
			byName: {
				summary: 'Search by name',
				value: JSON.stringify({
					name: { contains: 'avatar' },
				}),
			},
			complex: {
				summary: 'Complex filter',
				value: JSON.stringify({
					AND: [
						{ type: { eq: 'image/png' } },
						{ name: { contains: 'avatar' } },
					],
				}),
			},
		},
	})

	// ================= ORDER =================
	@ApiQuery({
		name: 'orderBy',
		required: false,
		description: 'Sort fields',
		examples: {
			newest: {
				summary: 'Newest first',
				value: JSON.stringify({ created_at: 'DESC' }),
			},
			nameAsc: {
				summary: 'Sort by name',
				value: JSON.stringify({ name: 'ASC' }),
			},
		},
	})

	// ================= PAGINATION =================
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
		description: 'List resources with count',
		schema: {
			example: {
				items: [
					{
						id: '550e8400-e29b-41d4-a716-446655440000',
						url: 'https://cdn.example.com/uploads/avatar.png',
						name: 'avatar.png',
						type: 'image/png',
						size: 204800,
						description: 'User avatar image',
						created_at: '2026-04-30T10:00:00.000Z',
						updated_at: '2026-04-30T10:00:00.000Z',
						deleted_at: null,
					},
				],
				count: 1,
			},
		},
	})
	findAll(@Query() query: ResourceQueryDto) {
		const options = buildFindOptions(query, [
			'id',
			'url',
			'name',
			'type',
			'size',
			'description',
			'created_at',
			'updated_at',
			'deleted_at',
		]);

		return this.resourcesService.findAllAndCount(options);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get resource by ID' })
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
		description: 'Resource found',
		schema: {
			example: {
				id: '550e8400-e29b-41d4-a716-446655440000',
				url: 'https://cdn.example.com/uploads/avatar.png',
				name: 'avatar.png',
				type: 'image/png',
				size: 204800,
				description: 'User avatar image',
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T10:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Resource not found',
		schema: {
			example: {
				statusCode: 404,
				message: 'Resource not found',
				error: 'Not Found',
			},
		},
	})
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.resourcesService.findOneById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update resource' })
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
		type: UpdateResourceDto,
		examples: {
			update: {
				summary: 'Update resource info',
				value: {
					name: 'avatar-new.png',
					description: 'Updated avatar',
				},
			},
		},
	})
	@ApiOkResponse({
		description: 'Resource updated',
		schema: {
			example: {
				id: '550e8400-e29b-41d4-a716-446655440000',
				url: 'https://cdn.example.com/uploads/avatar.png',
				name: 'avatar-new.png',
				type: 'image/png',
				size: 204800,
				description: 'Updated avatar',
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T11:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'Resource not found',
	})
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateResourceDto,
	) {
		const res = await this.resourcesService.update(id, dto);
		if (!res) {
			throw new NotFoundException('Resource not found');
		}
		return this.findOne(id);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete resource' })
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
		description: 'Resource not found',
	})
	async remove(@Param('id', ParseUUIDPipe) id: string) {
		const res = await this.resourcesService.remove(id);
		if (!res) {
			throw new NotFoundException('Resource not found');
		}
	}
}
