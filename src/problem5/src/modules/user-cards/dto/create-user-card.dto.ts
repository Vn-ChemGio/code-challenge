import { OmitType } from '@nestjs/swagger';
import { UserCard } from '../entities/user-card.entity';

export class CreateUserCardDto extends OmitType(UserCard, [
	'id',
	'created_at',
	'updated_at',
	'deleted_at',
]) {}
