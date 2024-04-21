import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { EmailCert } from 'src/modules/User/email.entity';
import { DataSource } from 'typeorm';
import { GetCodeDto } from './dto/get-code.dto';
import { VerifyDto } from './dto/verify.dto';
import { User } from 'src/modules/User/user.entity';

// 이메일 서비스 클래스
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
  ) {}

  // 이메일 인증 코드를 보내는 함수
  async sendVerifyCode(mailTo: string, code: number) {
    this.logger.log(`Sending verification code to ${mailTo}`);
    try {
      await this.mailerService
        .sendMail({
          to: mailTo,
          from: 'dpus.noreply@gmail.com',
          subject: '[DPUS] 이메일을 인증해 주세요.',
          html: `<table
          width="100%"
          border="0"
          cellpadding="0"
          cellspacing="0"
        >
          <tr>
            <td style="width: 100%">
              <img
                align="center"
                border="0"
                src="https://jtyebkumzywcvsnkcwki.supabase.co/storage/v1/object/sign/logo/logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJsb2dvL2xvZ28ucG5nIiwiaWF0IjoxNzAyNDgxODE4LCJleHAiOjg2NDE3MDIzOTU0MTh9.zuArXtBJfrOsieKiZ2hIJ-XuGMV2kfM8plKZ9V_TOJs&t=2023-12-13T15%3A36%3A58.343Z"
                alt="Image"
                title="Image"
                style="
                  border: 0px;
                  height: auto;
                  width: 100px;
                  display: block;
                  margin: 30px auto;
                "
              />
            </td>
          </tr>
          <tr style="padding: 20px; height: 50px">
            <td style="width: 80%; font-size: 12px; text-align: center">
              <p>아래 번호를 입력해 이메일 인증을 완료하세요!</p>
            </td>
          </tr>
          <tr style="text-align: center; margin-top: 20px">
            <td style="width: 100%; padding: 0 20px; font-size: 13px">
              <h2>${code}</h2>
            </td>
          </tr>
          <tr>
            <td>
              <p style="text-align: center; font-size: 10px; opacity: 60%">
                이 메일이 왜 온지 모르시겠다면, 무시해 주세요!
              </p>
            </td>
            <td style="height: 50px"></td>
          </tr>
        </table>
        `,
        })
        .then((result) => {
          this.logger.log(`Verification code sent to ${mailTo}`);
          return { message: 'done' };
        });
    } catch (error) {
      this.logger.error(`Failed to send verification code to ${mailTo}: ${error.message}`);
    }

    return { mesage: 'worked' };
  }

  // 랜덤 숫자를 생성하는 함수
  async createRandomNumb() {
    const random = Math.floor(Math.random() * (100000 - 999999 + 1)) + 999999;
    this.logger.log(`Random number generated: ${random}`);
    return random;
  }

  // 인증 번호를 설정하는 함수
  async setVerifyNumb(
    getCodeDto: GetCodeDto,
  ): Promise<{ message: string; generated: boolean }> {
    const certRepository = this.dataSource.getRepository(EmailCert);
    const userRepository = this.dataSource.getRepository(User);
    const certCode = await this.createRandomNumb();

    const foundUser = await userRepository.findOneBy({ email: getCodeDto.email });

    if (foundUser) {
      this.logger.warn(`Email already taken: ${getCodeDto.email}`);
      throw new ConflictException('Email already taken');
    }

    await this.sendVerifyCode(getCodeDto.email, certCode);

    const foundCert = await certRepository.findOneBy({
      email: getCodeDto.email,
    });

    if (foundCert) {
      await certRepository.delete({
        email: getCodeDto.email,
      });
    }

    const newCert = certRepository.create({
      email: getCodeDto.email,
      certNumb: `${certCode}`,
    });

    await certRepository.save(newCert);
    this.logger.log(`Verification number set for ${getCodeDto.email}`);
    return {
      message: 'successed',
      generated: true,
    };
  }

  // 인증 코드를 검증하는 함수
  async verifyCode(verifyDto: VerifyDto): Promise<{ verified: boolean }> {
    const certRepository = this.dataSource.getRepository(EmailCert);
    const found = await certRepository.findOneBy({
      email: verifyDto.email,
    });
    if (!found) {
      this.logger.warn(`Email not found: ${verifyDto.email}`);
      throw new ConflictException('Email not found');
    }

    this.logger.log(`Verify tried by ${verifyDto.email}`);

    if (found.certNumb !== verifyDto.code) {
      this.logger.warn(`Code not matched for ${verifyDto.email}`);
      throw new UnauthorizedException('Code not matched');
    }

    await certRepository.update({ email: verifyDto.email }, { verified: true });
    this.logger.log(`Verification successful for ${verifyDto.email}`);
    return { verified: true };
  }
}
