import { OmitType } from '@nestjs/swagger';
import { Resource } from '../entities/resource.entity';

export class CreateResourceDto extends OmitType(Resource, [
	'id',
	'created_at',
	'updated_at',
	'deleted_at',
]) {}
