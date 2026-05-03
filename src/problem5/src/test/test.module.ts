import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { User } from '@modules/users/entities/user.entity';
import { UserCard } from '@modules/user-cards/entities/user-card.entity';
import { Resource } from '@modules/resources/entities/resource.entity';

@Module({
	imports: [
		HttpModule.register({
			baseURL: 'https://my.api.mockaroo.com/',
		}),
		TypeOrmModule.forFeature([UserRole, User, UserCard, Resource]),
	],
	controllers: [TestController],
	providers: [TestService],
})
export class TestModule {}
