import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemService } from 'src/item/item.service';
import { Payment } from './entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Partner } from 'src/partner/entities/partner.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionStatus, TransactionType } from 'src/common/enums/enum';
import { UpdateTransactionDto } from './../transaction/dto/update-transaction.dto';
@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private itemService: ItemService,
    private dataSource: DataSource,
    @Inject(forwardRef(() => TransactionService))
    private transactionService: TransactionService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, creatorId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOneOrFail(Transaction, {
        where: {
          id: createPaymentDto.transactionId,
        },
      });

      if (transaction.status === TransactionStatus.PAID)
        throw new BadRequestException('Transaction is paid!');

      const payment = queryRunner.manager.create(Payment, {
        ...createPaymentDto,
      });

      payment.transaction = transaction;
      payment.creator = await queryRunner.manager.findOneOrFail(User, {
        where: {
          id: creatorId,
        },
      });

      if (
        transaction.type === TransactionType.INCOME &&
        !createPaymentDto.partnerId
      )
        throw new BadRequestException(
          'Partner ID is required to create payment for income transaction!',
        );

      if (createPaymentDto.partnerId) {
        payment.partner = await queryRunner.manager.findOneOrFail(Partner, {
          where: {
            id: createPaymentDto.partnerId,
          },
        });
      }

      const balance = transaction.totalAmount - transaction.paidAmount;

      if (createPaymentDto.amount > balance)
        throw new BadRequestException(
          `Your amount cannot greater than balance amount of transaction. The balance is: ${balance}`,
        );

      // Update transaction
      const updateTransactionDto: UpdateTransactionDto = {
        paidAmount: transaction.paidAmount + createPaymentDto.amount,
      };

      await this.transactionService.update(
        transaction,
        updateTransactionDto,
        queryRunner.manager,
      );

      if (transaction.sourceId) {
        await this.itemService.updateSourceStatus(
          transaction.sourceId,
          transaction.sourceType,
          queryRunner.manager,
          transaction.status,
        );
      }

      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.creator', 'creator')
      .leftJoinAndSelect('payment.partner', 'partner')
      .leftJoinAndSelect('payment.transaction', 'transaction')
      .select([
        'payment.id',
        'transaction.id',
        'payment.amount',
        'payment.method',
        'payment.note',
        'payment.createdAt',
        'creator.fullName',
        'partner.fullName',
      ])
      .orderBy('payment.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [payments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { payments, total };
    } else {
      const payments = await queryBuilder.getMany();
      return payments;
    }
  }

  async findOne(id: number) {
    const payment = await this.paymentRepo.findOneBy({ id });
    if (!payment) throw new NotFoundException('Payment not found!');
    return payment;
  }

  async findAllByTransactionId(
    transactionId: number,
    paginationDto?: PaginationDto,
  ) {
    const queryBuilder = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.creator', 'creator')
      .leftJoinAndSelect('payment.partner', 'partner')
      .leftJoinAndSelect('payment.transaction', 'transaction')
      .where('transaction.id = :transactionId', { transactionId })
      .select([
        'payment.id',
        'payment.createdAt',
        'transaction.id',
        'payment.amount',
        'payment.method',
        'payment.note',
        'creator.fullName',
        'partner.fullName',
      ])
      .orderBy('payment.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;
      const [payments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { payments, total };
    }

    const payments = await queryBuilder.getMany();
    return payments;
  }
}
