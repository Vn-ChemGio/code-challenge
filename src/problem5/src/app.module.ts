import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { database_config } from '@configs/configuration.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import * as Joi from 'joi';
import { UsersModule } from '@modules/users/users.module';
import { ResourcesModule } from '@modules/resources/resources.module';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import { UserCardsModule } from '@modules/user-cards/user-cards.module';
import { TestModule } from './test/test.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
			load: [database_config],
			cache: true,
			expandVariables: true,
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test', 'provision', 'staging')
					.default('development'),
				PORT: Joi.number().default(3000),
				DATABASE_HOST: Joi.string().default('localhost'),
				DATABASE_PORT: Joi.number().default(5432),
				DATABASE_USER: Joi.string().default('postgres'),
				DATABASE_PASS: Joi.string().default('yourpassword'),
				DATABASE_NAME: Joi.string().default('problem5_db'),
				DATABASE_SSL_MODE: Joi.boolean().default(false),
				INIT_MODE: Joi.boolean().default(false),
				abortEarly: false,
			}),
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>('DATABASE_HOST'),
				port: configService.get<number>('DATABASE_PORT'),
				username: configService.get<string>('DATABASE_USER'),
				password: configService.get<string>('DATABASE_PASS'),
				database: configService.get<string>('DATABASE_NAME'),
				autoLoadEntities: true,
				synchronize: true,
				logging: ['info', 'error'],
				ssl: configService.get<boolean>('DATABASE_SSL_MODE')
					? { rejectUnauthorized: false }
					: undefined,
				extra: configService.get<boolean>('DATABASE_SSL_MODE')
					? { ssl: { rejectUnauthorized: false } }
					: undefined,
			}),
			inject: [ConfigService],
		}),
		CacheModule.register({
			ttl: 5000,
			isGlobal: true,
		}),
		UsersModule,
		UserRolesModule,
		UserCardsModule,
		ResourcesModule,
		TestModule,
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor,
		},
	],
})
export class AppModule {}
