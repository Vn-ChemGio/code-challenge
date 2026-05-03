import { Controller, Post } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
	constructor(private readonly testService: TestService) {}

	@Post()
	create() {
		return this.testService.generateTestData();
	}
}
