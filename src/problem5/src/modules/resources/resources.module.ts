import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesService } from './services/resources.service';
import { ResourcesController } from './controllers/resources.controller';
import { Resource } from './entities/resource.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Resource])],
	controllers: [ResourcesController],
	providers: [ResourcesService],
	exports: [ResourcesService],
})
export class ResourcesModule {}
