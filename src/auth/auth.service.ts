import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from 'src/modules/User/user.entity';
import * as bcrypt from 'bcrypt';
import RegisterDto from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EmailCert } from 'src/modules/User/email.entity';

// 이 클래스는 인증 서비스를 제공합니다.
@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  // 이 함수는 사용자를 등록합니다.
  async registerUser(registerDto: RegisterDto): Promise<User> {
    try {
      const userRepository = this.dataSource.getRepository(User);
      const verifyRepository = this.dataSource.getRepository(EmailCert);

      // 이메일 인증을 확인합니다.
      const findEmail = await verifyRepository.findOneBy({
        email: registerDto.email,
      });
      this.logger.log(`Email verification checked for ${registerDto.email}`);

      // 이메일이 인증되지 않았다면 예외를 발생시킵니다.
      if (!findEmail || !findEmail.verified) {
        throw new UnauthorizedException('Email not verified');
      }

      // 이미 사용중인 이메일이 있는지 확인합니다.
      let foundUser = await userRepository.findOneBy({
        email: registerDto.email,
      });
      this.logger.log(`Existing email checked for ${registerDto.email}`);

      // 이미 사용중인 이메일이 있다면 예외를 발생시킵니다.
      if (foundUser) {
        throw new ConflictException('Email already used.');
      }

      // 비밀번호를 해시합니다.
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const passwordHashed = await bcrypt.hash(registerDto.password, salt);
      this.logger.log(`Password hashed for ${registerDto.email}`);

      // 새로운 사용자를 생성하고 저장합니다.
      const newUser = userRepository.create({
        email: registerDto.email,
        username: registerDto.username,
        password: passwordHashed,
      });
      userRepository.save(newUser);
      this.logger.log(`New user created for ${registerDto.email}`);

      return newUser;
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  // 이 함수는 사용자를 검증합니다.
  async validateUser(loginDto: LoginDto): Promise<User> {
    try {
      const userRepository = this.dataSource.getRepository(User);

      // 사용자를 찾습니다.
      let foundUser = await userRepository.findOneBy({
        email: loginDto.email,
      });
      this.logger.log(`User found for ${loginDto.email}`);

      // 사용자를 찾지 못했다면 예외를 발생시킵니다.
      if (!foundUser) {
        throw new UnauthorizedException('User not found');
      }

      // 비밀번호를 검증합니다.
      const validatePassword = await bcrypt.compare(
        loginDto.password,
        foundUser.password,
      );
      this.logger.log(`Password validated for ${loginDto.email}`);

      // 비밀번호가 일치하지 않는다면 예외를 발생시킵니다.
      if (!validatePassword) {
        throw new UnauthorizedException('password not matched');
      }

      return foundUser;
    } catch (error) {
      this.logger.warn(error.message);
    }
  }

  // 이 함수는 액세스 토큰을 생성합니다.
  async generateAccessToken(user: User): Promise<string> {
    const payload: payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      description: user.description,
      authority: user.role ? user.role.authority : 0,
    };
    this.logger.log(`Access token generated for ${user.email}`);
    return this.jwtService.signAsync(payload);
  }

  // 이 함수는 리프레시 토큰을 생성합니다.
  async generateRefreshToken(user: User): Promise<string> {
    const payload: payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      description: user.description,
      authority: user.role ? user.role.authority : 0,
    };
    this.logger.log(`Refresh token generated for ${user.email}`);

    return this.jwtService.signAsync(
      { id: payload.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION_TIME',
        ),
      },
    );
  }

  // 이 함수는 현재 해시된 리프레시 토큰을 가져옵니다.
  async getCurrentHashedRefreshToken(refreshToken: string) {
    const saltOrRounds = 10;
    const currentRefreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
    this.logger.log(`Current hashed refresh token retrieved`);
    return currentRefreshToken;
  }

  // 이 함수는 현재 리프레시 토큰의 만료 시간을 가져옵니다.
  async getCurrentRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() +
        parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')),
    );
    this.logger.log(`Current refresh token expiration time retrieved`);

    return currentRefreshTokenExp;
  }

  // 이 함수는 현재 리프레시 토큰을 설정합니다.
  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const userRepository = this.dataSource.getRepository(User);

    const currentRefreshToken =
      await this.getCurrentHashedRefreshToken(refreshToken);
    const currentRefreshTokenExp = await this.getCurrentRefreshTokenExp();
    await userRepository.update(userId, {
      currentRefreshToken: currentRefreshToken,
      currentRefreshTokenExp: currentRefreshTokenExp,
    });
    this.logger.log(`Current refresh token set for user ID ${userId}`);
  }

  // 이 함수는 토큰으로 사용자를 검증합니다.
  async tokenValidateUser(payload: payload): Promise<User | undefined> {
    const userRepository = this.dataSource.getRepository(User);

    const user = await userRepository.findOneBy({
      id: payload.id,
    });
    this.logger.log(`User validated by token for user ID ${payload.id}`);

    return user;
  }

  // 이 함수는 리프레시를 수행합니다.
  async refresh(refreshDto: RefreshTokenDto) {
    const { refresh_token } = refreshDto;

    const decodedRefreshToken = this.jwtService.verify(refresh_token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
    this.logger.log(`Refresh token decoded`);

    const userId = decodedRefreshToken.id;
    const user = await this.getUserIfRefreshTokenMatches(refresh_token, userId);
    this.logger.log(
      `User retrieved if refresh token matches for user ID ${userId}`,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid user!');
    }

    const accessToken = await this.generateAccessToken(user);
    this.logger.log(`Access token generated for user ID ${userId}`);

    return { accessToken };
  }

  // 이 함수는 리프레시 토큰이 일치하는 경우 사용자를 가져옵니다.
  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);
    const user: User = await userRepository.findOneBy({
      id: userId,
    });
    this.logger.log(`User retrieved for user ID ${userId}`);

    if (!user.currentRefreshToken) {
      return null;
    }

    const isRefreshMatch = await bcrypt.compare(
      refreshToken,
      user.currentRefreshToken,
    );
    this.logger.log(`Refresh token match checked for user ID ${userId}`);

    if (isRefreshMatch) {
      return user;
    }
  }

  // 이 함수는 리프레시 토큰을 제거합니다.
  async removeRefreshToken(userId: number): Promise<any> {
    const userRepository = this.dataSource.getRepository(User);
    await userRepository.update(userId, {
      currentRefreshToken: null,
      currentRefreshTokenExp: null,
    });
    this.logger.log(`Refresh token removed for user ID ${userId}`);
  }
}
