import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCard } from '../entities/user-card.entity';
import { BaseServiceAbstract } from '../../../shares/services/base.abstract.service';
import { CreateUserCardDto } from '../dto/create-user-card.dto';

@Injectable()
export class UserCardsService extends BaseServiceAbstract<UserCard> {
	constructor(
		@Inject(getRepositoryToken(UserCard))
		private readonly userCardsRepository: Repository<UserCard>,
	) {
		super(userCardsRepository);
	}

	async create(dto: CreateUserCardDto): Promise<UserCard> {
		if (
			!(await this.userCardsRepository.exists({
				where: {
					card_number: dto.card_number,
				},
			}))
		) {
			throw new ConflictException('Card already exists');
		}
		return super.create(dto);
	}
}
