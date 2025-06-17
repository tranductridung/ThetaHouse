import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { SourceType, TransactionStatus } from 'src/common/enums/enum';
import { UserService } from 'src/user/user.service';
import { loadSource } from 'src/item/helpers/source.helper';
import { CreateTransactionNoSourceDto } from './dto/create-transaction-no-source.dto';
import { PaymentService } from 'src/payment/payment.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private userService: UserService,
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
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

    transaction.status = this.getTransactionStatus(
      transaction.paidAmount,
      transaction.totalAmount,
    );

    transaction.creator = await this.userService.findOne(creatorId);

    await entityManager.save(transaction);
    return transaction;
  }

  async createNoSource(
    createTransactionNoSourceDto: CreateTransactionNoSourceDto,
    creatorId: number,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Transaction)
      : this.transactionRepo;

    const transaction = repo.create({
      ...createTransactionNoSourceDto,
    });

    transaction.status = this.getTransactionStatus(
      transaction.paidAmount,
      transaction.totalAmount,
    );

    transaction.creator = await this.userService.findOne(creatorId);

    await repo.save(transaction);
    return transaction;
  }

  getTransactionStatus(paidAmount: number, totalAmount: number) {
    if (paidAmount > totalAmount) return TransactionStatus.OVERPAID;
    if (paidAmount === totalAmount) return TransactionStatus.PAID;
    else if (paidAmount === 0) return TransactionStatus.UNPAID;
    else return TransactionStatus.PARTIAL;
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

  async findOneBySourceId(id: number, sources: string) {
    let type: SourceType;

    switch (sources) {
      case 'orders':
        type = SourceType.ORDER;
        break;
      case 'purchases':
        type = SourceType.PURCHASE;
        break;
      case 'consignments':
        type = SourceType.CONSIGNMENT;
        break;
      default:
        throw new NotFoundException('Url type not found!');
    }

    const transaction = await this.transactionRepo.findOneBy({
      sourceId: id,
      sourceType: type,
    });
    if (!transaction) throw new NotFoundException('Transaction not found!');

    const payments = await this.paymentService.findAllByTransactionId(
      transaction.id,
    );

    const source = await loadSource(
      transaction.sourceId,
      transaction.sourceType,
      this.dataSource,
    );
    return {
      ...transaction,
      source,
      payments,
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
        Number(transaction.paidAmount),
        Number(transaction.totalAmount),
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

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.creator', 'creator')
      .select([
        'transaction.id',
        'transaction.type',
        'transaction.sourceType',
        'transaction.totalAmount',
        'transaction.paidAmount',
        'transaction.status',
        'transaction.note',
        'creator.fullName',
      ])
      .orderBy('transaction.id', 'ASC');

    if (paginationDto) {
      const [transactions, total] = await queryBuilder
        .skip(paginationDto.page * paginationDto.limit)
        .take(paginationDto.limit)
        .getManyAndCount();

      return { transactions, total };
    } else {
      const transactions = await queryBuilder.getMany();
      return transactions;
    }
  }
}
