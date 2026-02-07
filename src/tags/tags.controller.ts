import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { TagsService } from './tags.service';
import { addTagDTO } from './dto/tags.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tag } from './entities/tags.entity';

@Controller('tags')
@ApiTags('Tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a tag' })
    @ApiBody({ type: addTagDTO })
    @ApiResponse({ status: 201, description: 'Tag created.' })
    addTag(
        @Body() body: addTagDTO
    ) {
        return this.tagsService.createTag(body);
    }

    @Get()
    @ApiOperation({ summary: 'List all tags' })
    @ApiResponse({ status: 200, description: 'List of tags.', type: Tag, isArray: true })
    getAllTasks() {
        return this.tagsService.getAllTags();
    }

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
