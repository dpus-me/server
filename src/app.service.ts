import { Injectable } from '@nestjs/common';
import { Render } from '@nestjs/common';

@Injectable()
export class AppService {
  @Render('index')
  getHello(): any {
    return {
      title: 'DPUS API 서버',
      message: 'DPUS에 오신 것을 환영합니다!',
    };
  }
}
