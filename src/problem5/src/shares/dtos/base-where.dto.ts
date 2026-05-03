// base-where.dto.ts
export class BaseWhereDto<T = any> {
	AND?: BaseWhereDto<T>[];
	OR?: BaseWhereDto<T>[];
	NOT?: BaseWhereDto<T> | BaseWhereDto<T>[];

	// dynamic fields
	[key: string]: any;
}
