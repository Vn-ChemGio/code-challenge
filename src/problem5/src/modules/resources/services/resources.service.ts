import { Inject, Injectable } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceAbstract } from '../../../shares/services/base.abstract.service';
import { Resource } from '../entities/resource.entity';

@Injectable()
export class ResourcesService extends BaseServiceAbstract<Resource> {
	constructor(
		@Inject(getRepositoryToken(Resource))
		private readonly resourcesRepository: Repository<Resource>,
	) {
		super(resourcesRepository);
	}
}
