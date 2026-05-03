import { createQueryDto } from '../../../shares/utilities/build-find-options';
import { User } from '../entities/user.entity';

export class UserQueryDto extends createQueryDto<User>(User) {}
