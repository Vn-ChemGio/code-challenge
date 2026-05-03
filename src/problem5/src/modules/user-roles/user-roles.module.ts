import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRolesController } from './controllers/user-roles.controller';
import { UserRolesService } from './services/user-roles.service';
import { UserRole } from './entities/user-role.entity';

@Global()
@Module({
	imports: [TypeOrmModule.forFeature([UserRole])],
	controllers: [UserRolesController],
	providers: [UserRolesService],
	exports: [UserRolesService],
})
export class UserRolesModule {}
