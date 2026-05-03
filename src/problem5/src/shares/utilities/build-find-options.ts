import {
	Between,
	Equal,
	FindManyOptions,
	FindOperator,
	FindOptionsOrder,
	FindOptionsWhere,
	ILike,
	In,
	LessThan,
	LessThanOrEqual,
	MoreThan,
	MoreThanOrEqual,
	Not,
} from 'typeorm';
import { BaseQueryDto } from '../dtos/base-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type {
	OperatorFor,
	OrderBy,
	Primitive,
	WhereInput,
	WhereResult,
} from '../../types/common.type';
import { BaseEntity } from '../entities/base.entity';
import { Type } from '@nestjs/common';
import { IsInt, IsObject, IsOptional, Min } from 'class-validator';
import { Transform, Type as TransformType } from 'class-transformer';

function isPrimitive(value: unknown): value is Primitive {
	return typeof value !== 'object' || value === null || value instanceof Date;
}

export function mapOperator<T extends Primitive>(
	value: T | OperatorFor<T>,
): T | FindOperator<T> {
	if (isPrimitive(value)) {
		return value;
	}

	const v = value as OperatorFor<T>;

	if ('eq' in v && v.eq !== undefined) return Equal(v.eq as T);
	if ('not' in v && v.not !== undefined) return Not(v.not as T);
	if ('in' in v && v.in !== undefined) return In(v.in as T[]);

	if ('gt' in v && v.gt !== undefined) return MoreThan(v.gt as T);
	if ('gte' in v && v.gte !== undefined) return MoreThanOrEqual(v.gte as T);
	if ('lt' in v && v.lt !== undefined) return LessThan(v.lt as T);
	if ('lte' in v && v.lte !== undefined) return LessThanOrEqual(v.lte as T);

	if ('between' in v && v.between !== undefined) {
		const [a, b] = v.between as [T, T];
		return Between(a, b);
	}

	if ('contains' in v && v.contains) {
		return ILike(`%${v.contains}%`) as unknown as FindOperator<T>;
	}

	if ('startsWith' in v && v.startsWith) {
		return ILike(`${v.startsWith}%`) as unknown as FindOperator<T>;
	}

	if ('endsWith' in v && v.endsWith) {
		return ILike(`%${v.endsWith}`) as unknown as FindOperator<T>;
	}

	return value as T;
}

function isOperatorObject(value: any): boolean {
	if (!value || typeof value !== 'object') return false;

	const operatorKeys = [
		'eq',
		'not',
		'in',
		'gt',
		'gte',
		'lt',
		'lte',
		'between',
		'contains',
		'startsWith',
		'endsWith',
	];

	return Object.keys(value).some((k) => operatorKeys.includes(k));
}

function isWhereInput<T>(value: unknown): value is WhereInput<T> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function buildWhere<T>(
	where: WhereInput<T> | undefined,
	allowedFields: (keyof T)[],
): WhereResult<T> {
	if (!where) return {};

	// OR
	if (Array.isArray(where.OR)) {
		return where.OR.map(
			(w) => buildWhere(w, allowedFields) as FindOptionsWhere<T>,
		);
	}

	const result: Partial<Record<keyof T, unknown>> = {};

	// AND
	if (Array.isArray(where.AND)) {
		for (const cond of where.AND) {
			Object.assign(result, buildWhere(cond, allowedFields));
		}
	}

	// fields
	const w = where as Record<string, unknown>;

	for (const key in w) {
		if (key === 'AND' || key === 'OR' || key === 'NOT') continue;
		if (!allowedFields.includes(key as keyof T)) continue;

		let value = w[key];
		// 👇 FIX: parse nested JSON strings
		value = parseDeepObject(value);

		if (value && typeof value === 'object' && !(value instanceof Date)) {
			if (isOperatorObject(value)) {
				result[key] = mapOperator(value as unknown as Primitive);
			} else if (isWhereInput<T>(value)) {
				result[key] = buildWhere(value, allowedFields);
			}
		} else {
			result[key] = value;
		}
	}

	// NOT
	if (where.NOT) {
		const not = buildWhere(where.NOT, allowedFields);

		if (!Array.isArray(not)) {
			for (const key in not) {
				result[key as keyof T] = Not(not[key]);
			}
		}
	}

	return result as FindOptionsWhere<T>;
}

export function buildFindOptions<T extends BaseEntity>(
	query: BaseQueryDto<T>,
	allowedFields: (keyof T)[],
): FindManyOptions<T> {
	const options: FindManyOptions<T> = {
		where: buildWhere<T>(query.where, allowedFields),
		skip: query.skip ?? 0,
		take: query.take ?? 10,
	};

	if (query.orderBy && typeof query.orderBy === 'object') {
		const order: FindOptionsOrder<T> = {};

		const entries = Object.entries(query.orderBy) as [keyof T, unknown][];

		for (const [key, value] of entries) {
			if (!allowedFields.includes(key)) continue;

			if (value === 'ASC' || value === 'DESC') {
				order[key] = value as FindOptionsOrder<T>[typeof key];
			}
		}

		options.order = order;
	}

	return options;
}

function parseDeepObject<T = unknown>(value: unknown): T {
	if (value !== null && typeof value === 'object') {
		return value as T;
	}

	if (typeof value === 'string') {
		try {
			return JSON.parse(value) as T;
		} catch {
			return value as T;
		}
	}

	return value as T;
}

export function createQueryDto<T>(entity: Type<T>): Type<BaseQueryDto<T>> {
	class QueryDto extends BaseQueryDto<T> {
		@ApiPropertyOptional({
			description: 'Prisma-like where filter (deepObject or JSON)',
			example: { name: { contains: 'john' } },
		})
		@IsOptional()
		@IsObject()
		@Transform(({ value }) => parseDeepObject<WhereInput<T>>(value))
		declare where: WhereInput<T>;

		@ApiPropertyOptional({
			description: 'Sort fields',
			example: { created_at: 'DESC' },
		})
		@IsOptional()
		@IsObject()
		@Transform(({ value }) => parseDeepObject<OrderBy<T>>(value))
		declare orderBy: OrderBy<T>;

		@ApiPropertyOptional({ example: 0 })
		@IsOptional()
		@TransformType(() => Number)
		@IsInt()
		@Min(0)
		declare skip: number;

		@ApiPropertyOptional({ example: 10 })
		@IsOptional()
		@TransformType(() => Number)
		@IsInt()
		@Min(1)
		declare take: number;
	}

	return QueryDto;
}
