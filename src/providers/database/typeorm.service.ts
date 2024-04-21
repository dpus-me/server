import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(
    connectionName?: string,
  ): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      //데이터베이스 설정
      type: 'postgres',
      database: this.configService.get<string>('DATABASE_NAME'),
      host: this.configService.get<string>('DATABASE_URL'),
      username: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      port: 5432,
      //엔티티 로드
      entities: [__dirname + '/../../**/**/*.entity.{js,ts}'],
      //데이터 동기화 설정
      synchronize: true,
      extra: {
        timezone: 'Asia/Seoul',
      },
    };
  }
}
