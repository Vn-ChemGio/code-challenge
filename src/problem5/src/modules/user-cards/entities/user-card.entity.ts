import { ApiProperty } from '@nestjs/swagger';
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
} from 'typeorm';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	Matches,
} from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';
import { BaseEntity } from '../../../shares/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({
	name: 'user_cards',
	orderBy: {
		created_at: 'DESC',
		user_id: 'DESC',
	},
})
@Index('IDX_user_card_unique', ['card_number'], {
	unique: true,
	where: 'deleted_at IS NULL',
})
export class UserCard extends BaseEntity {
	// ================= USER =================
	@Column({ type: 'uuid' })
	@ApiProperty({
		example: '550e8400-e29b-41d4-a716-446655440000',
	})
	user_id!: string;

	@ManyToOne(() => User, (user) => user.user_cards, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'user_id' })
	user!: User;

	// ================= CARD =================
	@Exclude({ toPlainOnly: true })
	@Column({ type: 'varchar', length: 20 })
	@IsNotEmpty()
	@IsString()
	@Length(12, 20)
	@Transform(({ value }: { value?: string }) => value?.replace(/\s+/g, ''))
	card_number!: string;

	@Column({ type: 'varchar', length: 4 })
	@ApiProperty({
		description: 'Last 4 digits of card',
		example: '1111',
	})
	last4!: string;

	@Column({ type: 'varchar', length: 100 })
	@ApiProperty({
		example: 'JOHN DOE',
	})
	@IsNotEmpty()
	@IsString()
	holder_name!: string;

	@Column({ type: 'varchar', length: 7 })
	@ApiProperty({
		example: '12/30',
	})
	@Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
		message: 'Expiry must be MM/YY format',
	})
	expiry_date!: string;

	@Column({ type: 'varchar', length: 20, nullable: true })
	@ApiProperty({
		example: 'VISA',
		required: false,
	})
	@IsOptional()
	@IsString()
	brand?: string;

	// ================= TOKEN (HIDDEN) =================
	@Exclude({ toPlainOnly: true })
	@Column({ type: 'varchar', length: 255, nullable: true })
	token?: string;

	// ================= GETTER =================
	@Expose()
	@ApiProperty({
		description: 'Masked card number',
		example: '****-****-****-1111',
	})
	get masked_card_number(): string {
		if (!this.last4) return '';
		return `****-****-****-${this.last4}`;
	}

	// ================= HOOK =================
	@BeforeInsert()
	@BeforeUpdate()
	private generateLast4(): void {
		if (!this.card_number) return;

		const clean = this.card_number.replace(/\s+/g, '');
		this.last4 = clean.slice(-4);
	}
}
