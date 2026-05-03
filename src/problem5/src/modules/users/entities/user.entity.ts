import { ApiProperty } from '@nestjs/swagger';
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { string } from 'joi';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Length,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';
import * as bcrypt from 'bcrypt';

import { Exclude, Transform } from 'class-transformer';
import { BaseEntity } from '../../../shares/entities/base.entity';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { UserCard } from '@modules/user-cards/entities/user-card.entity';

@Entity({
	name: 'users',
	orderBy: {
		created_at: 'DESC',
		email: 'ASC',
	},
})
@Index('ID_user_email', ['email'], {
	unique: true,
	where: 'deleted_at IS NULL',
})
export class User extends BaseEntity {
	@Column({ type: 'varchar', length: 50, default: '', nullable: false })
	@ApiProperty({
		type: string,
		description: 'First Name of the customer',
		example: 'John',
		required: false,
		nullable: false,
	})
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }: { value?: string }) => value?.trim())
	@MaxLength(50)
	@MinLength(1)
	@Matches(/^[\p{L}\p{M}\p{Zs}.'-]+$/u, {
		message:
			'First name can contain letters, spaces, dots, apostrophes and hyphens',
	})
	first_name!: string;

	@Column({ type: 'varchar', length: 50, default: '', nullable: false })
	@ApiProperty({
		type: string,
		description: 'Last Name of the customer',
		example: 'Smith',
		required: false,
		nullable: false,
	})
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }: { value?: string }) => value?.trim())
	@MaxLength(50)
	@MinLength(1)
	@Matches(/^[\p{L}\p{M}\p{Zs}.'-]+$/u, {
		message:
			'Last name can contain letters, spaces, dots, apostrophes and hyphens',
	})
	last_name!: string;

	@Column({
		type: 'citext',
		generatedType: 'STORED',
		asExpression: `trim(first_name || ' ' || last_name)`,
		nullable: false,
	})
	@ApiProperty({
		type: string,
		description: 'Full Name of the customer',
		example: 'ECMA',
		required: true,
		nullable: false,
	})
	name!: string;

	@Column({ type: 'citext', nullable: true, unique: false })
	@ApiProperty({
		type: string,
		description: 'Email of the user',
		example: 'abc123@techvify.com.vn',
		required: false,
		nullable: true,
	})
	@IsNotEmpty()
	@Transform(({ value }: { value?: string }) => value?.trim().toLowerCase())
	@IsEmail()
	@IsString()
	@MaxLength(255)
	email: string;

	@Column({ type: 'text', nullable: false })
	@Exclude({ toPlainOnly: true })
	@ApiProperty({
		type: string,
		description: 'Password of the user',
		example: '31313123dasd13l123lk312l31...',
		required: true,
		nullable: false,
	})
	@IsNotEmpty()
	@IsString()
	@Length(6, 255)
	password: string;

	@Column({ type: 'uuid', nullable: false })
	@ApiProperty({
		description: 'Role ID of the user',
		example: '550e8400-e29b-41d4-a716-446655440000',
	})
	@IsNotEmpty()
	@IsUUID()
	role_id!: string;

	@ManyToOne(() => UserRole, (role) => role.users, {
		onDelete: 'RESTRICT',
	})
	@JoinColumn({ name: 'role_id' })
	@Exclude({ toPlainOnly: true })
	@ApiProperty({
		type: () => UserRole,
		description: 'Role of the user',
	})
	role!: UserRole;

	@Transform(({ obj }: { obj: Partial<User> }) => obj.role?.name)
	role_name: string;

	@OneToMany(() => UserCard, (card) => card.user)
	@ApiProperty({
		type: () => [UserCard],
		required: false,
		description: 'List of user cards',
	})
	user_cards?: UserCard[];

	// ================= HELPER =================
	comparePassword(plain: string): Promise<boolean> {
		return bcrypt.compare(plain, this.password);
	}

	// ================= HOOK =================
	@BeforeInsert()
	@BeforeUpdate()
	private async hashPassword(): Promise<void> {
		if (!this.password) return;

		if (this.password.startsWith('$2b$')) return;

		const saltRounds = 10;
		this.password = await bcrypt.hash(this.password, saltRounds);
	}
}
