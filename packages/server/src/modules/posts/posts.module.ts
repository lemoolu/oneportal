import { Module } from '@nestjs/common';
import { PostsResolvers } from './posts.resolvers';
import { PostsService } from './posts.service';
// import { PrismaService } from '@/common';

@Module({
  providers: [PostsResolvers, PostsService],
  imports: [],
})
export class PostsModule {}
