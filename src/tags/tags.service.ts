import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tags.entity';
import { Repository } from 'typeorm';
import { addTagDTO } from './dto/tags.dto';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>
    ) {}

    async getAllTags(): Promise<Array<Tag>> {
        return await this.tagRepository.find();
    }

    async createTag(body: addTagDTO): Promise<ConfirmationMsg> {
        const tag = await this.tagRepository.save({
            name: body.name
        })
        return {
            id: tag.id,
            message: 'Tag created!'
        }
    }

    async findTagById(id: string): Promise<Tag> {
        const tag = await this.tagRepository.findOne({
            where: {
                id,
            }
        });
        if (!tag) {
            throw new NotFoundException('Tag not found!')
        }
        return tag;
    }

    async deleteTag(id: string): Promise<ConfirmationMsg> {
        const tag: Tag = await this.findTagById(id);
        const tagId = tag.id;
        await this.tagRepository.remove(tag);
        return {
            id: tagId,
            message: 'Tag deleted!'
        }
    }
}
