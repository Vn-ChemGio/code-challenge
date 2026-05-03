import { UserCard } from '../entities/user-card.entity';
import { createQueryDto } from '../../../shares/utilities/build-find-options';

export class UserCardQueryDto extends createQueryDto<UserCard>(UserCard) {}
