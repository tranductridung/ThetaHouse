import { UpdateTransactionDto } from './../transaction/dto/update-transaction.dto';
import {
  BadRequestException,
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

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private dataSource: DataSource,
    private transactionService: TransactionService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
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
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.paymentRepo.find();
  }

  async findOne(id: number) {
    const payment = await this.paymentRepo.findOneBy({ id });
    if (!payment) throw new NotFoundException('Payment not found!');
    return payment;
  }
}
