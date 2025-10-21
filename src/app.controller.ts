import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service.js';
import { bot, TELEGRAM_BOT_TOKEN } from './constant.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post(`/bot${TELEGRAM_BOT_TOKEN}`)
  handleWebhook(@Req() req, @Res() res) {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  }
}
