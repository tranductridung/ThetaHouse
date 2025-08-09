import { Token } from './entities/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), UserModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
