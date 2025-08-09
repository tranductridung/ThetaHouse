import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async create(refreshToken: string, userId: number) {
    const numberTokenOfUser = await this.countTokenByUser(userId);

    const maxToken = parseInt(this.configService.get('MAX_TOKEN') ?? '5', 10);

    // Delete oldest token
    if (numberTokenOfUser >= maxToken) {
      const oldestToken = await this.tokenRepository.findOne({
        where: { user: { id: userId } },
        order: { createdAt: 'ASC' },
      });
      if (oldestToken) await this.remove(oldestToken.id);
    }

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const user = await this.userService.findOne(userId, true);
    const token = this.tokenRepository.create({
      refreshToken: hashedToken,
      user,
    });

    return await this.tokenRepository.save(token);
  }

  async removeToken(refreshToken: string, userId: number) {
    const tokens = await this.tokenRepository.find({
      where: { user: { id: userId } },
    });

    for (const token of tokens) {
      if (await bcrypt.compare(refreshToken, token.refreshToken)) {
        return await this.remove(token.id);
      }
    }
  }

  async remove(id: number) {
    await this.tokenRepository.delete({ id });
    return { message: 'Token is remove!' };
  }

  async isTokenExist(refreshToken: string, userId: number) {
    const tokens = await this.tokenRepository.find({
      where: { user: { id: userId } },
    });

    for (const token of tokens) {
      if (await bcrypt.compare(refreshToken, token.refreshToken)) return true;
    }

    return false;
  }

  async countTokenByUser(userId: number) {
    return await this.tokenRepository.count({
      where: { user: { id: userId } },
    });
  }
}
