import { PrismaService } from '@/common';
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async testOne() {
    // console.log(this.prisma);
    return this.prisma.user.findUnique({
      where: {
        id: 1,
      },
    });
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async findOneById(userId: number): Promise<User | undefined> {
    return this.users.find(user => user.userId === userId);
  }
}
