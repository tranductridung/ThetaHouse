import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus } from 'src/common/enums/enum';
import { UserService } from 'src/user/user.service';
import { loadSource } from 'src/item/helpers/source.helper';
import { CreateTransactionNoSourceDto } from './dto/create-transaction-no-source.dto';
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private userService: UserService,
    private dataSource: DataSource,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    creatorId: number,
    entityManager: EntityManager,
  ) {
    const transaction = entityManager.create(Transaction, {
      ...createTransactionDto,
      paidAmount: 0,
      status: TransactionStatus.UNPAID,
    });

    transaction.creator = await this.userService.findOne(creatorId);

    await entityManager.save(transaction);
    return transaction;
  }

  async createNoSource(
    createTransactionNoSourceDto: CreateTransactionNoSourceDto,
    creatorId: number,
  ) {
    const transaction = this.transactionRepo.create({
      ...createTransactionNoSourceDto,
    });

    transaction.status = this.getTransactionStatus(
      transaction.paidAmount,
      transaction.totalAmount,
    );

    transaction.creator = await this.userService.findOne(creatorId);

    await this.transactionRepo.save(transaction);
    return transaction;
  }

  getTransactionStatus(paidAmount: number, totalAmount: number) {
    if (paidAmount > totalAmount)
      throw new BadRequestException(
        'Paid amount cannot be greater than total amount!',
      );

    if (paidAmount === 0) return TransactionStatus.UNPAID;
    else if (paidAmount === totalAmount) return TransactionStatus.PAID;
    else return TransactionStatus.PARTIAL;
  }

  findAll() {
    return this.transactionRepo.find();
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepo.findOneBy({ id });
    if (!transaction) throw new NotFoundException('Transaction not found!');

    const source = await loadSource(
      transaction.sourceId,
      transaction.sourceType,
      this.dataSource,
    );
    return {
      ...transaction,
      source,
    };
  }

  async update(
    transaction: Transaction,
    updateTransactionDto: UpdateTransactionDto,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Transaction)
      : this.transactionRepo;

    repo.merge(transaction, updateTransactionDto);

    if (updateTransactionDto.paidAmount)
      transaction.status = this.getTransactionStatus(
        transaction.paidAmount,
        transaction.totalAmount,
      );

    await repo.save(transaction);
    return transaction;
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);

    if (transaction.status !== TransactionStatus.UNPAID)
      throw new BadRequestException(
        'Cannot remove transaction is paid or partial!',
      );

    await this.transactionRepo.remove(transaction);
    return { message: 'Delete transaction success!' };
  }
}
