import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BambooService } from './bamboo.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';
import { PostBambooDto } from './dto/upload.dto';
import { Request } from 'express';
import { CommentBambooDto } from './dto/comment.dto';
import { LikeBambooDto } from './dto/like.dto';

@Controller('bamboo')
export class BambooController {
  constructor(private readonly bambooService: BambooService) {}

  @Get('/get/:page')
  async getAll(@Param('page') page: number) {
    return this.bambooService.getAll(page);
  }

  @Get('/popular')
  async getPopular() {
    return this.bambooService.getPopular();
  }

  @Get('/post/:id')
  async getPost(@Param('id') id: string) {
    if (isNaN(Number(id))) {
      throw new NotFoundException('Invalid ID');
    }
    const numericId = Number(id);
    return this.bambooService.getBamboo(numericId);
  }

  @Delete('/post/:id')
  async deletePost(@Param('id') id: number, @Req() req: Request) {
    if (isNaN(Number(id))) {
      throw new NotFoundException('Invalid ID');
    }
    const user = req.user;
    return await this.bambooService.deleteBamboo(id, user.id);
  }

  @Post('/upload')
  @UseGuards(AuthGuard)
  async uploadBamboo(@Body() uploadDto: PostBambooDto, @Req() req: Request) {
    const user = req.user;
    return await this.bambooService.uploadPost(uploadDto, user.id);
  }

  @Post('/comment')
  @UseGuards(AuthGuard)
  async commentBamboo(
    @Body() commentDto: CommentBambooDto,
    @Req() req: Request,
  ) {
    const user = req.user;

    return await this.bambooService.commentBamboo(commentDto, user.id);
  }

  @Get('/like/:id')
  @UseGuards(AuthGuard)
  async likeBamboo(@Body() likeBambooDto: LikeBambooDto, @Req() req: Request) {
    const user = req.user;
    return this.bambooService.like(likeBambooDto, user.id);
  }
}
