import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { TagsService } from './tags.service';
import { addTagDTO } from './dto/tags.dto';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Post()
    addTag(
        @Body() body: addTagDTO
    ) {
        return this.tagsService.createTag(body);
    }

    @Get()
    getAllTasks() {
        return this.tagsService.getAllTags();
    }

    @Get(':id')
    getTaskById(
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.tagsService.findTagById(id);
    }

    @Delete(':id')
    deleteTask(
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.tagsService.deleteTag(id);
    }
}
