import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EncryptionModule],
  exports: [TypeOrmModule, UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
