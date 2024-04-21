import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CommunityService {
  private logger = new Logger(CommunityService.name);
  constructor(private readonly dataSource: DataSource) {}

  async getAll() {
    const communityRepository = this.dataSource.getRepository(CommunityService);
  }
}
