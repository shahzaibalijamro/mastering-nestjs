import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { addTagDTO } from './dto/tags.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tag } from './entities/tags.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/utils/roles.decorator';
import {  UserRole } from 'src/user/entities/user.entity';
import { Public } from 'src/utils/public.decorator';

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
        @Body() body: addTagDTO
    ) {
        return this.tagsService.createTag(body);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'List all tags' })
    @ApiResponse({ status: 200, description: 'List of tags.', type: Tag, isArray: true })
    getAllTasks() {
        return this.tagsService.getAllTags();
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get tag by ID' })
    @ApiParam({ name: 'id', description: 'Tag ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Tag found.', type: Tag })
    @ApiResponse({ status: 404, description: 'Tag not found.' })
    getTaskById(
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
    deleteTask(
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.tagsService.deleteTag(id);
    }
}
