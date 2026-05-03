import { ApiProperty } from '@nestjs/swagger';
import {
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { date, string } from 'joi';
import { Exclude } from 'class-transformer';
import { IsEmpty, IsNotEmpty, IsOptional } from 'class-validator';

export class BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	@ApiProperty({
		type: string,
		description: 'Id of the user',
		example: '550e8400-e29b-41d4-a716-446655440000',
		required: false,
		nullable: true,
	})
	@IsOptional()
	@IsNotEmpty()
	id: string;

	@CreateDateColumn()
	@IsEmpty()
	@ApiProperty({
		type: date,
		description: 'Date create this record',
		example: new Date(),
		required: false,
		nullable: true,
	})
	created_at: Date;

	@UpdateDateColumn()
	@IsEmpty()
	@Exclude({ toPlainOnly: true })
	@ApiProperty({
		type: date,
		description: 'Last time update this record',
		example: new Date(),
		required: false,
		nullable: true,
	})
	updated_at: Date;

	@DeleteDateColumn()
	@IsEmpty()
	@Exclude({ toPlainOnly: true })
	@ApiProperty({
		type: date,
		description: 'Time this record had been deleted',
		example: null,
		required: false,
		nullable: true,
	})
	deleted_at: Date;
}
