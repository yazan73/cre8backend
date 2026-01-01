import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Unauthorized } from './common/decorators/unauthorized.decorator';

@Unauthorized()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return this.appService.getHealth();
  }
}
