import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactInformation } from './entities/contact-information.entity';
import { ContactInformationController } from './contact-information.controller';
import { ContactInformationService } from './contact-information.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactInformation])],
  controllers: [ContactInformationController],
  providers: [ContactInformationService],
  exports: [ContactInformationService],
})
export class ContactInformationModule {}
