import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactInformationService } from './contact-information.service';
import { CreateContactInformationDto } from './dto/create-contact-information.dto';
import { UpdateContactInformationDto } from './dto/update-contact-information.dto';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Contact Information')
@Controller('contact-information')
export class ContactInformationController {
  constructor(
    private readonly contactInformationService: ContactInformationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List contact information entries for the current user.' })
  getContacts(@Req() req) {
    return this.contactInformationService.findAllForUser(
      req.user as UserWithoutPassword,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a contact information entry.' })
  createContact(
    @Req() req,
    @Body() body: CreateContactInformationDto,
  ) {
    return this.contactInformationService.create(
      body,
      req.user as UserWithoutPassword,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact information entry.' })
  updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
    @Body() body: UpdateContactInformationDto,
  ) {
    return this.contactInformationService.update(
      id,
      body,
      req.user as UserWithoutPassword,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact information entry.' })
  removeContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    return this.contactInformationService.remove(
      id,
      req.user as UserWithoutPassword,
    );
  }
}
