import { Body, Controller, Get, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { GetCodeDto } from './dto/get-code.dto';
import { VerifyDto } from './dto/verify.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/get-code')
  async sendVerifyCode(@Body() getCodeDto: GetCodeDto) {
    return this.mailService.setVerifyNumb(getCodeDto);
  }

  @Post('/verify')
  async verify(@Body() verifyDto: VerifyDto) {
    return this.mailService.verifyCode(verifyDto);
  }
}
