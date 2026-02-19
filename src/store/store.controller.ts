import { Body, Controller, Get, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../temp_utils/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { Store } from './entities/store.entity';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { UpdateStoreDTO } from './dto/store.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('store')
@UseGuards(JwtAuthGuard,RolesGuard)
export class StoreController {
    constructor(
        private readonly storeService: StoreService
    ) {}

    @Roles(UserRole.SELLER)
    @Get()
    getStoreByUser(
        @Req() req
    ): Promise<Store>{
        const user = req.user as UserWithoutPassword;
        return this.storeService.getStoreByUser(user.id);
    }

    @Roles(UserRole.SELLER)
    @UseInterceptors(
        FileInterceptor('picture', {
            limits: {
                fileSize: 20 * 1024 * 1024
            }
        })
    )
    @Patch()
    updateStore(
        @Req() req,
        @Body() body : UpdateStoreDTO,
        @UploadedFile() file: Express.Multer.File
    ): Promise<Store> {
        const user = req.user as UserWithoutPassword;
        return this.storeService.updateStore(body, user, file)
    }
}
