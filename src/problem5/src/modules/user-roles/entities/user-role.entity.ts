import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shares/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity({
	name: 'user_roles',
	orderBy: {
		created_at: 'DESC',
	},
})
@Index('IDX_user_role_name_unique', ['name'], {
	unique: true,
	where: 'deleted_at IS NULL',
})
export class UserRole extends BaseEntity {
	@Column({ type: 'varchar', length: 50 })
	@ApiProperty({
		description: 'Role name',
		example: 'admin',
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	name!: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	@ApiProperty({
		description: 'Role description',
		example: 'Administrator role',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	description?: string;

	// ✅ 1 Role - N Users
	@OneToMany(() => User, (user) => user.role)
	users?: User[];
}
