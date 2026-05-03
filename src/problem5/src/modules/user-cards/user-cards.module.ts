import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCardsService } from './services/user-cards.service';
import { UserCardsController } from './controllers/user-cards.controller';
import { UserCard } from './entities/user-card.entity';

@Module({
	imports: [TypeOrmModule.forFeature([UserCard])],
	controllers: [UserCardsController],
	providers: [UserCardsService],
	exports: [UserCardsService],
})
export class UserCardsModule {}
