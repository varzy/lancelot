import { Injectable } from '@nestjs/common';
import AuthConfig from '../../config/auth.config';
import { ConfigService } from '@nestjs/config';
import * as Md5 from 'md5';

export interface User {
  id: number;
  username: string;
  password: string;
}

@Injectable()
export class UsersService {
  private readonly authConfig: AuthConfig;
  private readonly users: User[] = [];

  constructor(private readonly configService: ConfigService) {
    this.authConfig = configService.get<AuthConfig>('auth');
    this.users[0] = { id: 1, username: this.authConfig.superUsername, password: Md5(this.authConfig.superPassword) };
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
