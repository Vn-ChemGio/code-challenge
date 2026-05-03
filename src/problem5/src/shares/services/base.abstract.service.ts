import { FindManyOptions, FindOneOptions, ObjectId, Repository } from 'typeorm';
import { BaseServiceInterface } from './base.interface.service';
import { BaseEntity } from '../entities/base.entity';
import { FindAllResponse } from '../../types/common.type';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseServiceAbstract<
	T extends BaseEntity,
> implements BaseServiceInterface<T> {
	protected constructor(private readonly repository: Repository<T>) {
		this.repository = repository;
	}

	async create(dto: DeepPartial<T>): Promise<T> {
		const data = this.repository.create(dto);
		return this.repository.save(data);
	}

	async findAll(condition?: FindManyOptions<T>): Promise<Partial<T>[]> {
		return this.repository.find(condition);
	}

	async findAllAndCount(
		condition?: FindManyOptions<T>,
	): Promise<FindAllResponse<T>> {
		const [items, count] = await this.repository.findAndCount(condition);
		return {
			count,
			items,
		};
	}
	async findOne(condition: FindOneOptions<T>): Promise<T | null> {
		return this.repository.findOne(condition);
	}

	async findOneById(
		id: string,
		condition: FindOneOptions<T> = {},
	): Promise<T | null> {
		return this.repository.findOne(Object.assign(condition, { where: { id } }));
	}

	exists(condition: FindManyOptions<T>): Promise<boolean> {
		return this.repository.exists(condition);
	}

	async update(id: string, dto: QueryDeepPartialEntity<T>): Promise<number> {
		const res = await this.repository.update(id, dto);
		return res?.affected ?? 0;
	}

	async softDelete(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>
			| FindOptionsWhere<T>[],
	): Promise<number> {
		const res = await this.repository.softDelete(criteria);
		return res?.affected ?? 0;
	}

	async softDeleteById(id: string): Promise<number> {
		const res = await this.repository.softDelete(id);
		return res?.affected ?? 0;
	}

	async remove(
		criteria:
			| string
			| string[]
			| number
			| number[]
			| Date
			| Date[]
			| ObjectId
			| ObjectId[]
			| FindOptionsWhere<T>
			| FindOptionsWhere<T>[],
	): Promise<number> {
		const res = await this.repository.delete(criteria);
		return res?.affected ?? 0;
	}

	async removeById(id: string): Promise<number> {
		const res = await this.repository.delete(id);
		return res?.affected ?? 0;
	}
}
