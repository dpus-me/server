import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from './providers/database/typeorm.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './api/mail/mail.module';
import { BambooModule } from './api/bamboo/bamboo.module';
import { MealsModule } from './api/meals/meals.module';
import { CommunityModule } from './api/community/community.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    MailModule,
    BambooModule,
    MealsModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
