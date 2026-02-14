import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { signUpMethod, User, UserRole } from './entities/user.entity';
import { UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';
import { UpdatePasswordDTO, UpdateUserDTO } from './dto/user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      select: {
        password: true,
        createdAt: true,
        email: true,
        id: true,
        name: true,
        role: true,
        store: true,
        updatedAt: true,
        username: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  async getUserById(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User does not exist! ');
    }
    return user;
  }

  async updateUser(
    body: UpdateUserDTO,
    userObj: UserWithoutPassword,
    profilePicture: Express.Multer.File,
  ): Promise<UserWithoutPassword> {
    const user = await this.getUserById(userObj.id);
    const { name, username } = body;
    if (name) {
      user.name = name;
    }
    if (username) {
      const exist = await this.userRepository.findOneBy({ username });
      if (exist) {
        throw new ConflictException('A user with this username already exists');
      }
      user.username = username;
    }
    if (profilePicture) {
      const { url, public_id } =
        await this.cloudinaryService.uploadFile(profilePicture);
      user.profilePicture = {
        url,
        cloudinaryPublicId: public_id,
      };
    }
    await this.userRepository.save(user);
    return user;
  }

  async updateUserRole(
    role: UserRole,
    userObj: UserWithoutPassword,
  ): Promise<UserWithoutPassword> {
    const user = await this.getUserById(userObj.id);
    user.role = role;
    await this.userRepository.save(user);
    return user;
  }
}
