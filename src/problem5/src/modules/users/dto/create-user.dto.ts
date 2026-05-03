import { OmitType } from '@nestjs/swagger';
import { User } from '@modules/users/entities/user.entity';

export class CreateUserDto extends OmitType(User, [
	'id',
	'name',
	'created_at',
	'updated_at',
	'deleted_at',
	'role',
	'role_name',
	'user_cards',
	'comparePassword',
]) {}
