import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { UpdateUserDTO } from './dto/user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { StoreService } from '../store/store.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly storeService: StoreService,
    private readonly configService: ConfigService
  ) {}

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      select: {
        password: true,
        createdAt: true,
        email: true,
        id: true,
        googleId: true,
        method: true,
        profilePicture: true,
        name: true,
        role: true,
        store: true,
        updatedAt: true,
        username: true,
        tokenVersion: true,
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

  cookieConfigurations() {
      const NODE_ENV = this.configService.get<string>('NODE_ENV');
      if (!NODE_ENV) {
        throw new InternalServerErrorException();
      }
      console.log('production' === NODE_ENV);
      return {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24,
      }
    }


  async deleteUser(user: UserWithoutPassword) {
    const {profilePicture} = user;
    if (profilePicture && profilePicture.cloudinaryPublicId && profilePicture.cloudinaryPublicId !== "luxe_users_default_profilePicture_spanj5") {
      await this.cloudinaryService.deleteFile(profilePicture.cloudinaryPublicId)
    }
    if (user.role === UserRole.SELLER && user.store) {
      await this.storeService.deleteStore(user);
    }
    await this.userRepository.delete(user.id);
    return;
  }
}
