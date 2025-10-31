import { config } from 'dotenv';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ItemModule } from './item/item.module';
import { RoomModule } from './room/room.module';
import { AppController } from './app.controller';
import { TokenModule } from './token/token.module';
import { OrderModule } from './order/order.module';
import { CourseModule } from './course/course.module';
import { ReportModule } from './report/report.module';
import { ModulesModule } from './modules/modules.module';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';
import { ServiceModule } from './service/service.module';
import { PartnerModule } from './partner/partner.module';
import { RevenueModule } from './revenue/revenue.module';
import { PurchaseModule } from './purchase/purchase.module';
import { DiscountModule } from './discount/discount.module';
import { InventoryModule } from './inventory/inventory.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { EncryptionModule } from './encryption/encryption.module';
import { ConsigmentModule } from './consignment/consigment.module';
import { AppointmentModule } from './appointment/appointment.module';
import { TransactionModule } from './transaction/transaction.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';

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
    DashboardModule,
    CourseModule,
    EnrollmentModule,
    EncryptionModule,
    GoogleCalendarModule,
    ReportModule,
    AuthorizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
