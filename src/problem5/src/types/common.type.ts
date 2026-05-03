import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

export enum SORT_TYPE {
	'DESC' = 'desc',
	'ASC' = 'acs',
}

export type FindAllResponse<T> = { count: number; items: T[] };

export type SortParams = { sort_by: string; sort_type: SORT_TYPE };

export type SearchParams = { keywork: string; field: string };

export type PaginateParams = { offset: number; limit: number };

export type OrderBy<T> = Partial<Record<keyof T, 'ASC' | 'DESC'>>;

export type Primitive = string | number | boolean | Date;

type BaseOperator<T> = {
	eq?: T;
	not?: T;
	in?: T[];
};

type NumberOperator<T> = BaseOperator<T> & {
	gt?: T;
	gte?: T;
	lt?: T;
	lte?: T;
	between?: [T, T];
};

type StringOperator = BaseOperator<string> & {
	contains?: string;
	startsWith?: string;
	endsWith?: string;
};

export type OperatorFor<T> = T extends string
	? StringOperator
	: T extends number
		? NumberOperator<T>
		: T extends Date
			? NumberOperator<T>
			: BaseOperator<T>;

export type WhereInput<T> = {
	[K in keyof T]?: T[K] | OperatorFor<T[K]>;
} & {
	AND?: WhereInput<T>[];
	OR?: WhereInput<T>[];
	NOT?: WhereInput<T>;
};

export type WhereResult<T> = FindOptionsWhere<T> | FindOptionsWhere<T>[];
