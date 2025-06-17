import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async create(refreshToken: string) {
    const token = this.tokenRepository.create({ refreshToken });
    return await this.tokenRepository.save(token);
  }

  async removeToken(refreshToken: string) {
    return await this.tokenRepository.delete({ refreshToken });
  }

  async isTokenExist(refreshToken: string) {
    const isExist = await this.tokenRepository.exists({
      where: { refreshToken },
    });

    return isExist;
  }
}
