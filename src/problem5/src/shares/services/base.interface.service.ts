import { FindAllResponse } from '../../types/common.type';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface BaseServiceInterface<T> {
	create(dto: DeepPartial<T>): Promise<T>;

	update(id: string, dto: QueryDeepPartialEntity<T>): Promise<number>;

	findAll(condition?: object): Promise<Partial<T>[]>;

	findAllAndCount(condition?: object): Promise<FindAllResponse<T>>;

	findOne(condition: object): Promise<T | null>;

	findOneById(id: string, condition?: object): Promise<T | null>;

	exists(criteria?: object): Promise<boolean>;

	softDelete(id: any): Promise<number>;

	softDeleteById(id: string): Promise<number>;

	remove(id: any): Promise<number>;

	remove(id: string): Promise<number>;
}
