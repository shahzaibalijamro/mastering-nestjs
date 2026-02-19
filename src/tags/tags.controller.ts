import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { addTagDTO } from './dto/tags.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tag } from './entities/tags.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../utils/roles.decorator';
import {  UserRole } from '../user/entities/user.entity';
import { Public } from '../utils/public.decorator';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tags')
@ApiTags('Tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Roles(UserRole.SELLER)
    @Post()
    @ApiOperation({ summary: 'Create a tag' })
    @ApiBody({ type: addTagDTO })
    @ApiResponse({ status: 201, description: 'Tag created.' })
    addTag(
        @Body() body: addTagDTO,
        @Req() req,
    ) {
        return this.tagsService.createTag(body, req.user as UserWithoutPassword);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'List all tags' })
    @ApiResponse({ status: 200, description: 'List of tags.', type: Tag, isArray: true })
    getAllTags() {
        return this.tagsService.getAllTags();
    }

    @Roles(UserRole.SELLER)
    @Get('me')
    @ApiOperation({ summary: 'List all tags' })
    @ApiResponse({ status: 200, description: 'List of tags.', type: Tag, isArray: true })
    getAllTagsByUser(
        @Req() req,
    ) {
        return this.tagsService.getAllTagsByUser(req.user as UserWithoutPassword);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get tag by ID' })
    @ApiParam({ name: 'id', description: 'Tag ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Tag found.', type: Tag })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    getTagById(
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.tagsService.findTagById(id);
    }

    @Roles(UserRole.SELLER)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete tag by ID' })
    @ApiParam({ name: 'id', description: 'Tag ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Tag deleted.' })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    deleteTag(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req,
    ) {
        return this.tagsService.deleteTag(id, req.user as UserWithoutPassword);
    }
}
