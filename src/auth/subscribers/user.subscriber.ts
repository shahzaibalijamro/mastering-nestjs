import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { Store } from 'src/store/entities/store.entity';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>): Promise<void> {
    const storeRepository = event.manager.getRepository(Store);
    const store = await storeRepository.save({
      name: `${event.entity.name}'s Store`,
      description: `Welcome to ${event.entity.name}'s Store`,
      owner: event.entity,
    });
    console.log({
      id: store.id,
      message: 'Store created and assigned to the newly created User!',
    });
    return;
  }
}
