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
import {
  AppointmentStatus,
  PayerType,
  SourceType,
  TransactionStatus,
  TransactionType,
} from 'src/common/enums/enum';
import { UserService } from 'src/user/user.service';
import { loadSource } from 'src/item/helpers/source.helper';
import { CreateTransactionNoSourceDto } from './dto/create-transaction-no-source.dto';
import { PaymentService } from 'src/payment/payment.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { loadPayer } from './helpers/payer.helper';
import { User } from 'src/user/entities/user.entity';
import { Partner } from 'src/partner/entities/partner.entity';
import { TransactionWithName } from './interfaces/transaction.interface';
import { CreateSalaryTransactionDto } from './dto/create-salary-transaction.dto';
import { Appointment } from 'src/appointment/entities/appointment.entity';
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

  checkPayer = async (
    type: TransactionType,
    payerType: PayerType,
    payerId: number,
    manager?: EntityManager,
  ) => {
    if (type === TransactionType.INCOME && payerType === PayerType.USER)
      throw new BadRequestException('User cannot pay for income transaction!');
    if (type === TransactionType.EXPENSE && payerType === PayerType.PARTNER)
      throw new BadRequestException(
        'Partner cannot pay for expense transaction!',
      );

    // Check if payed exist
    await loadPayer(payerId, payerType, manager ?? this.dataSource);
  };

  async create(
    createTransactionDto: CreateTransactionDto,
    creatorId: number,
    entityManager: EntityManager,
  ) {
    await this.checkPayer(
      createTransactionDto.type,
      createTransactionDto.payerType,
      createTransactionDto.payerId,
      entityManager,
    );

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
    await this.checkPayer(
      createTransactionNoSourceDto.type,
      createTransactionNoSourceDto.payerType,
      createTransactionNoSourceDto.payerId,
      manager,
    );

    const repo = manager
      ? manager.getRepository(Transaction)
      : this.transactionRepo;

    const transaction = repo.create({
      ...createTransactionNoSourceDto,
      paidAmount: 0,
      status: TransactionStatus.UNPAID,
    });

    transaction.status = this.getTransactionStatus(
      transaction.paidAmount,
      transaction.totalAmount,
    );

    transaction.creator = await this.userService.findOne(creatorId);

    await repo.save(transaction);
    return transaction;
  }

  async createHealerSalaryTransaction(
    createsSalaryTransactionDto: CreateSalaryTransactionDto,
    creatorId: number,
    entityManager: EntityManager,
  ) {
    const transactionExist = await this.transactionRepo.findOne({
      where: {
        healer: { id: createsSalaryTransactionDto.healerId },
        month: createsSalaryTransactionDto.month,
        year: createsSalaryTransactionDto.year,
      },
      relations: ['healer'],
    });
    console.log('2');

    if (transactionExist)
      throw new BadRequestException(
        `Salary transaction for ${createsSalaryTransactionDto.month}/${createsSalaryTransactionDto.year} - 
        healer ${transactionExist.healer.fullName} already exists!`,
      );
    console.log('3');

    const [appointments, count] = await this.dataSource
      .createQueryBuilder(Appointment, 'a')
      .leftJoinAndSelect('a.healer', 'healer')
      .select(['a.id', 'healer.fullName'])
      .where(
        'EXTRACT(MONTH FROM startAt) = :month AND EXTRACT(YEAR FROM startAt) = :year',
        {
          month: createsSalaryTransactionDto.month,
          year: createsSalaryTransactionDto.year,
        },
      )
      .andWhere('healer.id = :healerId', {
        healerId: createsSalaryTransactionDto.healerId,
      })
      .andWhere('a.status = :status', {
        status: AppointmentStatus.COMPLETED,
      })
      .getManyAndCount();

    if (count === 0)
      throw new BadRequestException(
        `Healer has not completed any therapy in ${createsSalaryTransactionDto.month}/${createsSalaryTransactionDto.year}!`,
      );
    console.log('4');

    const transaction = entityManager.create(Transaction, {
      // ...createsSalaryTransactionDto,
      month: createsSalaryTransactionDto.month,
      year: createsSalaryTransactionDto.year,
      note: `Salary for healer ${appointments[0]?.healer?.fullName || 'Unknown'} ${createsSalaryTransactionDto.month}/${createsSalaryTransactionDto.year} (150k * ${count})!`,
      totalAmount: count * 150000,
      paidAmount: 0,
      status: TransactionStatus.UNPAID,
    });
    console.log('5');

    transaction.creator = await this.userService.findOne(creatorId);

    transaction.healer = await this.userService.findOne(
      createsSalaryTransactionDto.healerId,
    );

    await entityManager.save(transaction);
    return transaction;
  }

  async createSalaryTransactionsForAllHealers(
    month: number,
    year: number,
    creatorId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const transactions: Transaction[] = [];

    try {
      const healers = await queryRunner.manager.find(User);

      for (const healer of healers) {
        const dto: CreateSalaryTransactionDto = {
          healerId: healer.id,
          month,
          year,
        };

        try {
          const transaction = await this.createHealerSalaryTransaction(
            dto,
            creatorId,
            queryRunner.manager,
          );
          transactions.push(transaction);
        } catch (error) {
          if (
            error instanceof BadRequestException &&
            (error.message.includes('already exists') ||
              error.message.includes('has not completed any therapy'))
          ) {
            continue;
          } else {
            throw error;
          }
        }
      }

      await queryRunner.commitTransaction();
      return transactions;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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
      .leftJoin('transaction.creator', 'creator')
      .leftJoin(
        User,
        'payer_user',
        'payer_user.id = transaction.payerId AND transaction.payerType = :payerTypeUser',
        { payerTypeUser: PayerType.USER },
      )
      .leftJoin(
        Partner,
        'payer_partner',
        'payer_partner.id = transaction.payerId AND transaction.payerType = :payerTypePartner',
        { payerTypePartner: PayerType.PARTNER },
      )
      .select([
        'transaction.id',
        'transaction.type AS type',
        'transaction.createdAt AS transaction_createdAt',
        'transaction.sourceType AS sourceType',
        'transaction.totalAmount AS totalAmount',
        'transaction.paidAmount AS paidAmount',
        'transaction.status AS status',
        'transaction.note AS note',
        'creator.fullName AS creatorFullName',
        'COALESCE(payer_user.fullName, payer_partner.fullName) AS payerFullName',
      ])
      .orderBy('transaction.createdAt', 'DESC');

    const rawAndEntityTransactions =
      paginationDto?.page !== undefined && paginationDto?.limit !== undefined
        ? await queryBuilder
            .skip(paginationDto.page * paginationDto.limit)
            .take(paginationDto.limit)
            .getRawAndEntities()
        : await queryBuilder.getRawAndEntities();

    const total = await queryBuilder.getCount();

    return {
      transactions: (rawAndEntityTransactions.raw as TransactionWithName[]).map(
        (transaction) => ({
          id: transaction.transaction_id,
          type: transaction.type,
          createdAt: transaction.createdAt,
          sourceType: transaction.sourceType,
          totalAmount: transaction.totalAmount,
          paidAmount: transaction.paidAmount,
          status: transaction.status,
          note: transaction.note,
          creator: {
            fullName: transaction.creatorFullName,
          },
          payer: {
            fullName: transaction.payerFullName,
          },
        }),
      ),
      total,
    };
  }
}
