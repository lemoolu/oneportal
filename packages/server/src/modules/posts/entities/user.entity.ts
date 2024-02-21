import { Field, ObjectType } from '@nestjs/graphql';
import { Post as PostrType } from '@prisma/client';

type RestrictProperties<T, U> = {
  [K in keyof T]: K extends keyof U ? T[K] : never;
} & Required<U>;

@ObjectType()
export class Post implements RestrictProperties<Post, PostrType> {
  id: string;

  title: string;

  text: string;

  isPublished: boolean;
}
