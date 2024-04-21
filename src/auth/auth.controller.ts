import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import { Request, Response } from 'express';
import { AuthGuard } from './guards/auth.guards';
import { JwtRefreshGuard } from './guards/refresh.guards';
import { Logger } from '@nestjs/common';

// 이 클래스는 인증 컨트롤러를 제공합니다.
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  // 인증 서비스를 주입합니다.
  constructor(private readonly authService: AuthService) {}

  // 이 함수는 사용자를 등록합니다.
  @Post('/register')
  async register(
    @Req() req: Request,
    @Body() registerDto: RegisterDto,
  ): Promise<any> {
    this.logger.log('Registering a user');
    // 사용자를 등록하고 결과를 반환합니다.
    return await this.authService.registerUser(registerDto);
  }

  // 이 함수는 사용자를 로그인합니다.
  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<any> {
    this.logger.log('Logging in a user');
    // 사용자를 검증하고 토큰을 생성합니다.
    const user = await this.authService.validateUser(loginDto);
    const access_token = await this.authService.generateAccessToken(user);
    const refresh_token = await this.authService.generateRefreshToken(user);

    // 리프레시 토큰을 설정합니다.
    await this.authService.setCurrentRefreshToken(refresh_token, user.id);

    // 헤더와 쿠키에 토큰을 설정합니다.
    res.setHeader('Authorization', 'Bearer ' + [access_token, refresh_token]);
    res.cookie('access_token', access_token, {
      httpOnly: true,
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
    });

    // 로그인 성공 메시지와 토큰을 반환합니다.
    res
      .status(200)
      .send({ message: 'login successed', access_token, refresh_token });
  }

  // 이 함수는 액세스 토큰을 새로 고칩니다.
  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('Refreshing access token');
    try {
      // 새로운 액세스 토큰을 생성합니다.
      const newAccessToken = (
        await this.authService.refresh({
          refresh_token: req.cookies['refresh_token'],
        })
      ).accessToken;
      // 헤더와 쿠키에 새로운 액세스 토큰을 설정합니다.
      res.setHeader('Authorization', 'Bearer ' + newAccessToken);
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
      });
      // 새로운 액세스 토큰을 반환합니다.
      res.send({ newAccessToken });
    } catch (error) {
      this.logger.error('Invalid refresh token');
      // 잘못된 리프레시 토큰이라면 예외를 발생시킵니다.
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  // 이 함수는 사용자를 로그아웃합니다.
  @Post('/logout')
  @UseGuards(JwtRefreshGuard)
  async logout(@Req() req: any, @Res() res: Response): Promise<any> {
    this.logger.log('Logging out a user');
    // 리프레시 토큰을 제거합니다.
    await this.authService.removeRefreshToken(req.user.id);
    // 쿠키에서 토큰을 제거합니다.
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    // 로그아웃 성공 메시지를 반환합니다.
    return res.send({
      message: 'logout success',
    });
  }

  // 이 함수는 사용자가 인증되었는지 확인합니다.
  @Get('/authenticate')
  @UseGuards(AuthGuard)
  isAuthenticated(@Req() req: Request): any {
    this.logger.log('Checking if a user is authenticated');
    // 인증된 사용자를 반환합니다.
    const user: any = req.user;

    return user;
  }
}
