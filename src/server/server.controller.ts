import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ServerService } from './server.service.js';

@Controller()
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post('/connect')
  async connectServer(@Req() req, @Res() res) {
    const data = await this.serverService.connectServer(req.body);
    res.status(200).json(data);
  }

  @Post('/order')
  async handleOrder(@Req() req, @Res() res) {
    const data = await this.serverService.handleOrder(req.body);
    console.log(data);
    res.status(200).json(data);
  }
}
