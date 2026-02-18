import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tags.entity';
import { Repository } from 'typeorm';
import { addTagDTO } from './dto/tags.dto';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';
import { UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>
    ) {}

    async getAllTags(): Promise<Array<Tag>> {
        return await this.tagRepository.find();
    }

    async getAllTagsByUser(user: UserWithoutPassword): Promise<Tag[]> {
        return await this.tagRepository.find({
            where: {
                userId: user.id
            },
            select: {
                createdAt: true,
                id: true,
                name: true,
                products: {
                    id: true,
                    reviews: false,
                    tags: false
                },
                updatedAt: true,
                userId: true,
                user: false
            },
            relations: {
                products: {
                    reviews: false,
                    tags: false
                }
            }
        })
    }

    async createTag(body: addTagDTO, user: UserWithoutPassword): Promise<ConfirmationMsg> {
        const tag = await this.tagRepository.save({
            name: body.name,
            user,
            userId: user.id
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

    async deleteTag(id: string, user: UserWithoutPassword): Promise<ConfirmationMsg> {
        const tag: Tag = await this.findTagById(id);
        if (tag.userId !== user.id) {
            throw new ForbiddenException("Forbidden!");
        }
        const tagId = tag.id;
        await this.tagRepository.remove(tag);
        return {
            id: tagId,
            message: 'Tag deleted!'
        }
    }
}
