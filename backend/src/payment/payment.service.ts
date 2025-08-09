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
import { Transaction } from '../transaction/entities/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  PayerType,
  SourceStatus,
  TransactionStatus,
} from 'src/common/enums/enum';
import { UpdateTransactionDto } from './../transaction/dto/update-transaction.dto';
import { loadSource } from 'src/item/helpers/source.helper';
import { PaymentWithName } from './interfaces/payment.interfaces';
import { Partner } from 'src/partner/entities/partner.entity';
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
      else if (transaction.status === TransactionStatus.OVERPAID)
        throw new BadRequestException('Transaction is overpaid!');

      if (transaction.sourceId && transaction.sourceType) {
        const source = await loadSource(
          transaction.sourceId,
          transaction.sourceType,
          queryRunner.manager,
        );

        if (source && source.status === SourceStatus.CANCELLED) {
          throw new BadRequestException(
            `${transaction.sourceType} is cancelled!`,
          );
        }
      }

      const payment = queryRunner.manager.create(Payment, createPaymentDto);

      payment.transaction = transaction;
      payment.creator = await queryRunner.manager.findOneOrFail(User, {
        where: {
          id: creatorId,
        },
      });

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
    const baseQueryBuilder = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.creator', 'creator')
      .leftJoin('payment.transaction', 'transaction')
      .leftJoin(
        User,
        'payer_user',
        'payer_user.id = transaction.payerId AND transaction.payerType = :payerUserType',
        { payerUserType: PayerType.USER },
      )
      .leftJoin(
        Partner,
        'payer_partner',
        'payer_partner.id = transaction.payerId AND transaction.payerType = :payerPartnerType',
        { payerPartnerType: PayerType.PARTNER },
      )
      .select([
        'payment.id',
        'transaction.id',
        'payment.amount AS amount',
        'payment.method AS method',
        'payment.note AS note',
        'payment.createdAt',
        'creator.fullName AS creatorFullName',
        'COALESCE(payer_user.fullName, payer_partner.fullName) AS payerFullName',
      ])
      .orderBy('payment.createdAt', 'DESC');

    const rawAndEntityPayments =
      paginationDto?.page !== undefined && paginationDto?.limit !== undefined
        ? await baseQueryBuilder
            .skip(paginationDto.page * paginationDto.limit)
            .take(paginationDto.limit)
            .getRawAndEntities()
        : await baseQueryBuilder.getRawAndEntities();

    return {
      payments: (rawAndEntityPayments.raw as PaymentWithName[]).map(
        (payment) => ({
          id: payment.payment_id,
          transaction: { id: payment.transaction_id },
          amount: payment.amount,
          method: payment.method,
          note: payment.note,
          createdAt: payment.createdAt,
          creator: {
            fullName: payment.creatorFullName,
          },
          payer: {
            fullName: payment.payerFullName,
          },
        }),
      ),
      total: await baseQueryBuilder.getCount(),
    };
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
