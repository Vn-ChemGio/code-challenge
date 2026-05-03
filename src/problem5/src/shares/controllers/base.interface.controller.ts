import { FindAllResponse } from '../../types/common.type';

export interface BaseControllerInterface<T> {
	create(dto: object): Promise<T>;

	findAll(condition?: object): Promise<FindAllResponse<T>>;

	findOne(id: string): Promise<T | null>;

	update(id: string, dto: object): Promise<T | null>;

	remove(id: string): Promise<void>;
}
