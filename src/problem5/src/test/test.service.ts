import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { User } from '@modules/users/entities/user.entity';
import { UserCard } from '@modules/user-cards/entities/user-card.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Resource } from '@modules/resources/entities/resource.entity';

@Injectable()
export class TestService {
	constructor(
		@InjectEntityManager() private manager: EntityManager,
		private readonly httpService: HttpService,
	) {}

	async fetchToGetJson<T>(path: string): Promise<T[]> {
		const response = await lastValueFrom(
			this.httpService.get<T[]>(path, {
				headers: {
					'X-API-Key': '4f12bf10',
				},
			}),
		);
		return response.data;
	}

	async generateTestData() {
		if (process.env.NODE_ENV != 'development' || !process.env.INIT_MODE) {
			return Promise.resolve();
		}

		return this.manager.transaction(async (manager) => {
			if (
				await manager.exists(UserRole, {
					where: { name: In(['admin', 'user']) },
				})
			) {
				throw new BadRequestException('User role admin|user already exists');
			}

			const dataRoles = manager.create(UserRole, [
				{ id: '99629bf4-2240-427e-8259-17992521e949', name: 'user' },
				{ id: '8dba0c15-53f9-4b71-84cf-741b1aaa5fb2', name: 'admin' },
			]);

			const userRoles = await manager.save(UserRole, dataRoles);

			const dataUsers = manager.create(
				User,
				(await this.fetchToGetJson<Partial<User>>('problem5-users.json')).map(
					({ role_name, ...item }) => ({
						...item,
						role_id:
							userRoles.find((role) => role.id === role_name)?.id ??
							userRoles[0].id,
					}),
				),
			);
			const users = await manager.save(User, dataUsers, {
				chunk: 200,
			});

			const dataUserCards = manager.create(
				UserCard,
				(
					await this.fetchToGetJson<Partial<UserCard>>(
						'problem5-user-cards.json',
					)
				).map(({ ...item }) => ({
					...item,
					user_id: users[Math.floor(Math.random() * users.length)].id,
				})),
			);
			const userCards = await manager.save(UserCard, dataUserCards, {
				chunk: 100,
			});

			const dataResources = manager.create(
				Resource,
				await this.fetchToGetJson<Partial<User>>('problem5-resources.json'),
			);
			const resources = await manager.save(Resource, dataResources, {
				chunk: 200,
			});

			return {
				roles: userRoles.length,
				users: users.length,
				userCards: userCards.length,
				resources: resources.length,
			};
		});
	}
}
