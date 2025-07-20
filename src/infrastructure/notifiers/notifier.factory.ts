import { EmailNotifier } from './email.notifier';
import { PushNotifier } from './push.notifier';
import type { INotificationStrategy } from '@/domain/notifications/notification.strategy';

type NotifierType = 'email' | 'push';

export class NotifierFactory {
  public static create(type: NotifierType): INotificationStrategy {
    switch (type) {
      case 'email':
        return new EmailNotifier();
      case 'push':
        return new PushNotifier();
      default:
        // This case should be unreachable due to TypeScript's type checking
        throw new Error(`Unknown notifier type: ${type}`);
    }
  }
}
