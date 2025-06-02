import { UpdateTransactionDto } from './../transaction/dto/update-transaction.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { TransactionStatus } from 'src/common/enums/enum';
import { TransactionService } from 'src/transaction/transaction.service';
import { User } from 'src/user/entities/user.entity';
import { Partner } from 'src/partner/entities/partner.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => TransactionService))
    private transactionService: TransactionService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, creatorId: number) {
    // amount, method, note, transactionId,
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

      payment.creator = await queryRunner.manager.findOneOrFail(User, {
        where: {
          id: creatorId,
        },
      });

      payment.customer = await queryRunner.manager.findOneOrFail(Partner, {
        where: {
          id: createPaymentDto.customerId,
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

      await queryRunner.manager.save(payment);
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.creator', 'creator')
      .leftJoinAndSelect('payment.customer', 'customer')
      .select([
        'payment.amount',
        'payment.method',
        'payment.note',
        'creator.fullName',
        'customer.fullName',
      ])
      .getMany();
  }

  async findOne(id: number) {
    const payment = await this.paymentRepo.findOneBy({ id });
    if (!payment) throw new NotFoundException('Payment not found!');
    return payment;
  }

  async findAllByTransactionId(id: number) {
    const payments = await this.paymentRepo.find({
      where: {
        transaction: { id: id },
      },
    });
    console.log(id, payments);

    return payments;
  }
}
