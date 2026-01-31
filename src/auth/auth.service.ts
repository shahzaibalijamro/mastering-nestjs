import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';

@Injectable()
export class AuthService {
    constructor (
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}
}
