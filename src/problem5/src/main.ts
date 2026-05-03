import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as qs from 'qs';
import { configSwagger } from '@configs/api-docs.config';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.set('query parser', (str: string) =>
		qs.parse(str, {
			allowDots: true,
			depth: 10,
		}),
	);

	app.use(helmet());
	app.enableCors();

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: { enableImplicitConversion: true },
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	configSwagger(app); //
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
