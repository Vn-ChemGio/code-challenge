// base-query.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, Min } from 'class-validator';
import type { WhereInput } from '../../types/common.type';

export class BaseQueryDto<T> {
	@IsOptional()
	@IsObject()
	where?: WhereInput<T>;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	skip?: number = 0;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	take?: number = 10;

	@IsOptional()
	orderBy?: Partial<Record<keyof T, 'ASC' | 'DESC'>>;
}
