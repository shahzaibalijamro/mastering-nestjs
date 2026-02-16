// was using this before

// import {
//   DataSource,
//   EntitySubscriberInterface,
//   EventSubscriber,
//   InsertEvent,
//   UpdateEvent,
// } from 'typeorm';
// import { User } from '../../user/entities/user.entity';
// import { InjectDataSource } from '@nestjs/typeorm';
// import { Store } from 'src/store/entities/store.entity';

// @EventSubscriber()
// export class UserSubscriber implements EntitySubscriberInterface<User> {
//   constructor(@InjectDataSource() dataSource: DataSource) {
//     dataSource.subscribers.push(this);
//   }

//   listenTo() {
//     return User;
//   }

//   async afterInsert(event: InsertEvent<User>): Promise<void> {
//     await event.manager
//       .createQueryBuilder()
//       .insert()
//       .into(Store)
//       .values({
//         name: `${event.entity.name}'s Store`,
//         description: `Welcome to ${event.entity.name}'s store!`,
//         owner: event.entity,
//       })
//       .execute();
//     console.log({
//       message: 'Store created and assigned to the newly created User!',
//     });
//     return;
//   }

//   afterUpdate(event: UpdateEvent<User>): void {
//     console.log(event.updatedColumns, "UPDATED COLUMNS");
//     return;
//   }
// }
