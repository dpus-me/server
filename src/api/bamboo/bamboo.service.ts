import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { PostBambooDto } from './dto/upload.dto';
import { User } from 'src/modules/User/user.entity';
import { BambooPost } from 'src/modules/bamboo/post.entity';
import { CommentBambooDto } from './dto/comment.dto';
import { BambooComments } from 'src/modules/bamboo/comments.entity';
import { LikeBambooDto } from './dto/like.dto';
import { BambooLike } from 'src/modules/bamboo/like.entity';
import { DeleteBambooDto } from './dto/delete-bamboo.dto';
import { Roles } from 'src/modules/User/roles.entity';

// 대나무숲 서비스
@Injectable()
export class BambooService {
  private logger = new Logger(BambooService.name);
  constructor(private readonly dataSource: DataSource) {}

  // 모든 대나무숲 게시물 가져오기
  async getAll(pageNumb: number): Promise<BambooPost[]> {
    this.logger.log(`getAll method called with page number: ${pageNumb}`);
    const bambooRepository = this.dataSource.getRepository(BambooPost);
    let bamboos = await bambooRepository.find({
      order: {
        createdAt: 'DESC',
      },
      skip: pageNumb * 8,
      take: 8,
    });

    // 현재 시간 가져오기
    const now = new Date();

    // 각 대나무 게시물의 생성 시간을 "1일 전", "1주일 전", "1달 전" 등으로 변환
    bamboos = bamboos.map((bamboo) => {
      const diffTime = Math.abs(now.getTime() - bamboo.createdAt.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let timeAgo: string;

      if (diffMinutes < 2) {
        timeAgo = '방금 전';
      } else if (diffMinutes < 60) {
        timeAgo = `${diffMinutes}분 전`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}시간 전`;
      } else if (diffDays < 2) {
        timeAgo = '1일 전';
      } else if (diffDays < 8) {
        timeAgo = `${diffDays}일 전`;
      } else if (diffDays < 31) {
        timeAgo = `${Math.floor(diffDays / 7)}주일 전`;
      } else {
        timeAgo = `${Math.floor(diffDays / 30)}달 전`;
      }

      return { ...bamboo, timeAgo };
    });

    return bamboos;
  }

  //인기있는 개시글들을 가져옵니다.
  async getPopular() {
    this.logger.log(`Get popular bomboo posts`);
    const bambooRepository = this.dataSource.getRepository(BambooPost);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    let bamboos = await bambooRepository.find({
      where: {
        createdAt: MoreThanOrEqual(oneWeekAgo),
      },
      take: 8,
      skip: 0,
      order: {
        viewd: 'DESC',
      },
    });

    // 현재 시간 가져오기
    const now = new Date();

    // 각 대나무 게시물의 생성 시간을 "1일 전", "1주일 전", "1달 전" 등으로 변환
    bamboos = bamboos.map((bamboo) => {
      const diffTime = Math.abs(now.getTime() - bamboo.createdAt.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let timeAgo: string;

      if (diffMinutes < 2) {
        timeAgo = '방금 전';
      } else if (diffMinutes < 60) {
        timeAgo = `${diffMinutes}분 전`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}시간 전`;
      } else if (diffDays < 2) {
        timeAgo = '1일 전';
      } else if (diffDays < 8) {
        timeAgo = `${diffDays}일 전`;
      } else if (diffDays < 31) {
        timeAgo = `${Math.floor(diffDays / 7)}주일 전`;
      } else {
        timeAgo = `${Math.floor(diffDays / 30)}달 전`;
      }

      return { ...bamboo, timeAgo };
    });

    return bamboos;
  }

  // 특정 대나무숲 게시물 가져오기
  async getBamboo(id: number) {
    this.logger.log(`getBamboo method called with id: ${id}`);
    const bambooRepository = this.dataSource.getRepository(BambooPost);
    const commentRepository = this.dataSource.getRepository(BambooComments);
    const likeRepository = this.dataSource.getRepository(BambooLike);

    let currentBamboo = await bambooRepository.findOne({
      relations: { author: true },
      where: { id },
    });

    if (!currentBamboo) {
      throw new NotFoundException('Bamboo not found');
    }

    let author = null;
    let authorId = null;

    if (!currentBamboo.anonymity) {
      author = currentBamboo.author.username;
      authorId = currentBamboo.author.id;
      this.logger.log(author);
    }

    let comments = await commentRepository.find({
      relations: {
        post: true,
        author: true,
      },
      where: {
        post: {
          id: currentBamboo.id,
        },
      },
    });

    const likes = await likeRepository.countBy({
      post: {
        id: currentBamboo.id,
      },
    });

    await bambooRepository.update(
      { id: id },
      {
        viewd: currentBamboo.viewd + 1,
      },
    );

    // 현재 시간 가져오기
    const now = new Date();

    // 대나무 게시물의 생성 시간을 "1일 전", "1주일 전", "1달 전" 등으로 변환
    const diffTime = Math.abs(
      now.getTime() - currentBamboo.createdAt.getTime(),
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let timeAgo: string;

    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 2) {
      timeAgo = '방금 전';
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      timeAgo = `${diffHours}시간 전`;
    } else if (diffDays < 2) {
      timeAgo = '1일 전';
    } else if (diffDays < 8) {
      timeAgo = `${diffDays}일 전`;
    } else if (diffDays < 31) {
      timeAgo = `${Math.floor(diffDays / 7)}주일 전`;
    } else {
      timeAgo = `${Math.floor(diffDays / 30)}달 전`;
    }

    // 댓글의 생성 시간을 "1일 전", "1주일 전", "1달 전" 등으로 변환
    comments = comments.map((comment) => {
      const diffTime = Math.abs(now.getTime() - comment.createdAt.getTime());
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let timeAgo: string;

      if (diffMinutes < 2) {
        timeAgo = '방금 전';
      } else if (diffMinutes < 60) {
        timeAgo = `${diffMinutes}분 전`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}시간 전`;
      } else if (diffDays < 2) {
        timeAgo = '1일 전';
      } else if (diffDays < 8) {
        timeAgo = `${diffDays}일 전`;
      } else if (diffDays < 31) {
        timeAgo = `${Math.floor(diffDays / 7)}주일 전`;
      } else {
        timeAgo = `${Math.floor(diffDays / 30)}달 전`;
      }

      return { ...comment, timeAgo };
    });

    return {
      ...currentBamboo,
      timeAgo,
      authorId,
      author,
      comments,
      likes,
    };
  }

  // 대나무숲 게시물 업로드
  async uploadPost(
    uploadDto: PostBambooDto,
    userId: number,
  ): Promise<{ message: string }> {
    this.logger.log(`uploadPost method called with userId: ${userId}`);
    try {
      const userRepository = this.dataSource.getRepository(User);
      const bambooRepository = this.dataSource.getRepository(BambooPost);

      const author = await userRepository.findOneBy({
        id: userId,
      });

      const newPost = bambooRepository.create({
        title: uploadDto.title,
        contents: uploadDto.contents,
        createdAt: new Date(),
        author: author,
        anonymity: uploadDto.anonymity,
      });

      bambooRepository.save(newPost);

      return { message: 'done.' };
    } catch (error) {
      this.logger.warn(`uploadPost method error: ${error.message}`);
    }
  }

  // 대나무숲 게시물에 댓글 달기
  async commentBamboo(
    commentBambooDto: CommentBambooDto,
    userId: number,
    parent?: number,
  ): Promise<{ message: string }> {
    this.logger.log(`commentBamboo method called with userId: ${userId}`);
    try {
      const bambooRepository = this.dataSource.getRepository(BambooPost);
      const commentRepository = this.dataSource.getRepository(BambooComments);
      const userRepository = this.dataSource.getRepository(User);

      const author = await userRepository.findOneBy({
        id: userId,
      });

      if (!author) {
        throw new ConflictException('User not found');
      }

      const currentPost = await bambooRepository.findOneBy({
        id: commentBambooDto.postId,
      });

      const newComment = commentRepository.create({
        post: currentPost,
        contents: commentBambooDto.contents,
        parents: !parent ? null : parent,
        author: author,
        createdAt: new Date(),
      });

      await commentRepository.save(newComment);

      return { message: 'done' };
    } catch (error) {
      this.logger.warn(`commentBamboo method error: ${error.message}`);
    }
  }

  // 대나무숲 게시물 좋아요
  async like(
    likeDto: LikeBambooDto,
    userId: number,
  ): Promise<{ message: string }> {
    this.logger.log(`like method called with userId: ${userId}`);
    try {
      const userRepository = this.dataSource.getRepository(User);
      const likeRepository = this.dataSource.getRepository(BambooLike);
      const postRepository = this.dataSource.getRepository(BambooPost);

      const foundUser = await userRepository.findOneBy({
        id: userId,
      });

      const foundPost = await postRepository.findOneBy({
        id: likeDto.postId,
      });

      const foundLike = await likeRepository.findOneBy({
        post: foundPost,
        author: foundUser,
      });

      let newLike = undefined;

      if (foundLike) {
        newLike = await likeRepository.delete({ id: foundLike.id });
      } else {
        newLike = likeRepository.create({
          author: foundUser,
          post: foundPost,
        });
        await likeRepository.save(newLike);
      }

      return { message: 'done' };
    } catch (error) {
      this.logger.warn(`like method error: ${error.message}`);
    }
  }

  async deleteBamboo(bambooId: number, userId: number) {
    const bambooRepository = this.dataSource.getRepository(BambooPost);
    const userRepository = this.dataSource.getRepository(User);

    const bamboo = await bambooRepository.findOne({
      where: {
        id: bambooId,
      },
      relations: ['role'],
    });
    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['role'],
      order: {
        role: {
          authority: 'DESC',
        },
      },
    });

    try {
      if (user.role.authority >= 5 || bamboo.author.id === userId) {
        await bambooRepository.delete(bamboo);
        return {
          message: 'done',
        };
      } else {
        throw new UnauthorizedException("Can't delete this bamboo");
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
