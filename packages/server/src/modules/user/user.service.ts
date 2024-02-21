import { PrismaService } from '@/common';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

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

  async testOne(): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        id: 1,
      },
    });
  }

  async findOne(username: string): Promise<any> {
    return this.users.find(user => user.username === username);
  }

  async findOneById(userId: number): Promise<any> {
    return this.users.find(user => user.userId === userId);
  }
}
