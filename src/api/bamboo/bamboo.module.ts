import { Module } from '@nestjs/common';
import { BambooService } from './bamboo.service';
import { BambooController } from './bamboo.controller';

@Module({
  providers: [BambooService],
  controllers: [BambooController],
})
export class BambooModule {}
