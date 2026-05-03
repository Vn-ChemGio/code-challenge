import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseEntity } from '../../../shares/entities/base.entity';

@Entity({
	name: 'resources',
	orderBy: {
		created_at: 'DESC',
	},
})
@Index('IDX_resource_url_unique', ['url'], {
	unique: true,
	where: 'deleted_at IS NULL',
})
export class Resource extends BaseEntity {
	@Column({ type: 'varchar', length: 2048 })
	@ApiProperty({
		description: 'Resource URL',
		example: 'https://cdn.example.com/uploads/file.png',
	})
	@IsNotEmpty()
	@IsString()
	@IsUrl()
	@MaxLength(255)
	@Transform(({ value }: { value?: string }) => value?.trim())
	url!: string;

	@Column({ type: 'varchar', length: 100, nullable: true })
	@ApiProperty({
		description: 'Original file name',
		example: 'avatar.png',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(100)
	name?: string;

	@Column({ type: 'varchar', length: 50, nullable: true })
	@ApiProperty({
		description: 'Resource type',
		example: 'image/png',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(50)
	type?: string;

	@Column({ type: 'int', nullable: true })
	@ApiProperty({
		description: 'File size in bytes',
		example: 204800,
		required: false,
	})
	@IsOptional()
	size?: number;

	@Column({ type: 'text', nullable: true })
	@ApiProperty({
		description: 'Description',
		example: 'User avatar image',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;
}
