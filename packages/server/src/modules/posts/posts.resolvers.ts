import { Resolver, Query, Mutation, Args, Subscription, Int, ResolveField } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { PubSub } from 'graphql-subscriptions';
import { Post } from './entities/user.entity';

const pubSub = new PubSub();

@Resolver()
export class PostsResolvers {
  constructor(private readonly postService: PostsService) { }

  @Query(() => [Post])
  async posts() {
    return this.postService.findAll();
  }

  @Query(() => Post, { nullable: true })
  async post(@Args('id') args: string) {
    return this.postService.findOne(args);
  }

  // @ResolveField('post2', () => Post)
  // async post2(@Args('id') args: string) {
  //   return this.postService.findOne(args);
  // }

  // @Mutation('createPost')
  // async create(@Args('input') args: NewPost): Promise<Post> {
  //   const createdPost = await this.postService.create(args);
  //   pubSub.publish('postCreated', { postCreated: createdPost });
  //   return createdPost;
  // }

  // @Mutation('updatePost')
  // async update(@Args('input') args: UpdatePost): Promise<Post> {
  //   return this.postService.update(args);
  // }

  // @Mutation('deletePost')
  // async delete(@Args('id') args: string): Promise<Post> {
  //   return this.postService.delete(args);
  // }

  // @Subscription('postCreated')
  // postCreated() {
  //   return pubSub.asyncIterator('postCreated');
  // }
}
