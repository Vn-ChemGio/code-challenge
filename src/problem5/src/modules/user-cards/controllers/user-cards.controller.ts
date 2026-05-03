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

import { UserCardsService } from '../services/user-cards.service';
import { CreateUserCardDto } from '../dto/create-user-card.dto';
import { UpdateUserCardDto } from '../dto/update-user-card.dto';
import { UserCard } from '../entities/user-card.entity';
import { BaseControllerInterface } from '../../../shares/controllers/base.interface.controller';
import { UserCardQueryDto } from '@modules/user-cards/dto/query-user-card.dto';
import { buildFindOptions } from '../../../shares/utilities/build-find-options';

@ApiTags('User Cards')
@Controller('user-cards')
export class UserCardsController implements BaseControllerInterface<UserCard> {
	constructor(private readonly userCardsService: UserCardsService) {}

	@Post()
	@ApiOperation({ summary: 'Create user card' })
	@ApiBody({
		type: CreateUserCardDto,
		examples: {
			valid: {
				summary: 'Create card',
				value: {
					user_id: '550e8400-e29b-41d4-a716-446655440000',
					card_number: '4111111111111111',
					holder_name: 'JOHN DOE',
					expiry_date: '12/30',
					brand: 'VISA',
				},
			},
		},
	})
	@ApiCreatedResponse({
		description: 'User card created',
		schema: {
			example: {
				id: '770e8400-e29b-41d4-a716-446655440000',
				user_id: '550e8400-e29b-41d4-a716-446655440000',
				last4: '1111',
				holder_name: 'JOHN DOE',
				expiry_date: '12/30',
				brand: 'VISA',
				masked_card_number: '****-****-****-1111',
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
					'card_number must be between 12 and 20 characters',
					'Expiry must be MM/YY format',
				],
				error: 'Bad Request',
			},
		},
	})
	create(@Body() dto: CreateUserCardDto) {
		return this.userCardsService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all user cards' })

	// ================= WHERE =================
	@ApiQuery({
		name: 'where',
		required: false,
		description: 'Prisma-like filter (JSON string)',
		examples: {
			byUser: {
				summary: 'Filter by user_id',
				value: JSON.stringify({
					user_id: { eq: '550e8400-e29b-41d4-a716-446655440000' },
				}),
			},
			byBrand: {
				summary: 'Filter by brand',
				value: JSON.stringify({
					brand: { eq: 'VISA' },
				}),
			},
			complex: {
				summary: 'Complex filter',
				value: JSON.stringify({
					AND: [
						{ brand: { eq: 'VISA' } },
						{ holder_name: { contains: 'JOHN' } },
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
			byUser: {
				summary: 'Sort by user',
				value: JSON.stringify({ user_id: 'ASC' }),
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
		description: 'List user cards',
		schema: {
			example: {
				items: [
					{
						id: '770e8400-e29b-41d4-a716-446655440000',
						user_id: '550e8400-e29b-41d4-a716-446655440000',
						last4: '1111',
						holder_name: 'JOHN DOE',
						expiry_date: '12/30',
						brand: 'VISA',
						masked_card_number: '****-****-****-1111',
						created_at: '2026-04-30T10:00:00.000Z',
						updated_at: '2026-04-30T10:00:00.000Z',
						deleted_at: null,
					},
				],
				count: 1,
			},
		},
	})
	findAll(@Query() query: UserCardQueryDto) {
		const options = buildFindOptions(query, [
			'id',
			'user_id',
			'last4',
			'holder_name',
			'expiry_date',
			'brand',
			'token',
			'created_at',
			'updated_at',
			'deleted_at',
		]);

		return this.userCardsService.findAllAndCount(options);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get user card by ID' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '770e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiOkResponse({
		description: 'User card found',
		schema: {
			example: {
				id: '770e8400-e29b-41d4-a716-446655440000',
				user_id: '550e8400-e29b-41d4-a716-446655440000',
				last4: '1111',
				holder_name: 'JOHN DOE',
				expiry_date: '12/30',
				brand: 'VISA',
				masked_card_number: '****-****-****-1111',
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T10:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'User card not found',
		schema: {
			example: {
				statusCode: 404,
				message: 'User card not found',
				error: 'Not Found',
			},
		},
	})
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.userCardsService.findOneById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update user card' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '770e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiBody({
		type: UpdateUserCardDto,
		examples: {
			updateHolder: {
				summary: 'Update holder name',
				value: {
					holder_name: 'JANE DOE',
				},
			},
		},
	})
	@ApiOkResponse({
		description: 'User card updated',
		schema: {
			example: {
				id: '770e8400-e29b-41d4-a716-446655440000',
				user_id: '550e8400-e29b-41d4-a716-446655440000',
				last4: '1111',
				holder_name: 'JANE DOE',
				expiry_date: '12/30',
				brand: 'VISA',
				masked_card_number: '****-****-****-1111',
				created_at: '2026-04-30T10:00:00.000Z',
				updated_at: '2026-04-30T11:00:00.000Z',
				deleted_at: null,
			},
		},
	})
	@ApiNotFoundResponse({
		description: 'User card not found',
	})
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateUserCardDto,
	) {
		const res = await this.userCardsService.update(id, dto);
		if (!res) {
			throw new NotFoundException('User card not found');
		}
		return this.findOne(id);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete user card' })
	@ApiParam({
		name: 'id',
		required: true,
		schema: {
			type: 'string',
			format: 'uuid',
			example: '770e8400-e29b-41d4-a716-446655440000',
		},
	})
	@ApiResponse({
		status: 204,
		description: 'Deleted successfully',
	})
	@ApiNotFoundResponse({
		description: 'User card not found',
	})
	async remove(@Param('id', ParseUUIDPipe) id: string) {
		const res = await this.userCardsService.remove(id);
		if (!res) {
			throw new NotFoundException('User card not found');
		}
	}
}
