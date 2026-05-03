import { createQueryDto } from '../../../shares/utilities/build-find-options';
import { Resource } from '../entities/resource.entity';

export class ResourceQueryDto extends createQueryDto<Resource>(Resource) {}
