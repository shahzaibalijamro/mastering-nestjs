import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInformation } from './entities/contact-information.entity';
import { CreateContactInformationDto } from './dto/create-contact-information.dto';
import { UpdateContactInformationDto } from './dto/update-contact-information.dto';
import { UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ContactInformationService {
  constructor(
    @InjectRepository(ContactInformation)
    private readonly contactInformationRepository: Repository<ContactInformation>,
  ) {}

  async create(
    body: CreateContactInformationDto,
    user: UserWithoutPassword,
  ): Promise<ContactInformation> {
    const contact = this.contactInformationRepository.create({
      ...body,
      user: { id: user.id } as User,
    });
    return this.contactInformationRepository.save(contact);
  }

  async findAllForUser(user: UserWithoutPassword): Promise<ContactInformation[]> {
    return this.contactInformationRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(
    id: string,
    body: UpdateContactInformationDto,
    user: UserWithoutPassword,
  ): Promise<ContactInformation> {
    const contact = await this.getByIdForUser(id, user);
    Object.assign(contact, body);
    return this.contactInformationRepository.save(contact);
  }

  async remove(id: string, user: UserWithoutPassword): Promise<void> {
    const contact = await this.getByIdForUser(id, user);
    await this.contactInformationRepository.remove(contact);
  }

  async getByIdForUser(
    id: string,
    user: UserWithoutPassword,
  ): Promise<ContactInformation> {
    const contact = await this.contactInformationRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
    });
    if (!contact) {
      throw new NotFoundException('Contact information not found!');
    }
    return contact;
  }
}
