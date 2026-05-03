import { NotFoundException } from '@nestjs/common';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { FindManyOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseControllerInterface } from './base.interface.controller';
import { BaseEntity } from '../entities/base.entity';
import { BaseServiceAbstract } from '../services/base.abstract.service';

export abstract class BaseControllerAbstract<
	T extends BaseEntity,
> implements BaseControllerInterface<T> {
	protected constructor(private readonly service: BaseServiceAbstract<T>) {
		this.service = service;
	}

	create(dto: DeepPartial<T>) {
		return this.service.create(dto);
	}

	findAll(condition?: FindManyOptions<T>) {
		return this.service.findAllAndCount(condition);
	}

	findOne(id: string) {
		return this.service.findOneById(id);
	}

	async update(id: string, dto: QueryDeepPartialEntity<T>) {
		const res = await this.service.update(id, dto);
		if (!res) {
			throw new NotFoundException(`id ${id} not found`);
		} else {
			return this.findOne(id);
		}
	}

	async remove(id: string) {
		const res = await this.service.remove(id);
		if (!res) {
			throw new NotFoundException(`id ${id} not found`);
		} else {
			return;
		}
	}
}
