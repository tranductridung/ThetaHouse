import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenModule } from './token/token.module';
import { config } from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { ServiceModule } from './service/service.module';
import { ConsigmentModule } from './consignment/consigment.module';
import { OrderModule } from './order/order.module';
import { PurchaseModule } from './purchase/purchase.module';
import { PartnerModule } from './partner/partner.module';
import { DiscountModule } from './discount/discount.module';
import { ItemModule } from './item/item.module';
import { AppointmentModule } from './appointment/appointment.module';
import { RoomModule } from './room/room.module';
import { ModulesModule } from './modules/modules.module';
import { TransactionModule } from './transaction/transaction.module';
import { PaymentModule } from './payment/payment.module';
import { RevenueModule } from './revenue/revenue.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';

config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
    TokenModule,
    AuthModule,
    MailModule,
    ProductModule,
    InventoryModule,
    ServiceModule,
    ConsigmentModule,
    OrderModule,
    PurchaseModule,
    PartnerModule,
    DiscountModule,
    ItemModule,
    AppointmentModule,
    RoomModule,
    ModulesModule,
    TransactionModule,
    PaymentModule,
    RevenueModule,
    ReportsModule,
    DashboardModule,
    ReportsModule,
    CourseModule,
    EnrollmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
