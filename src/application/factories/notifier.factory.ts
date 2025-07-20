import { EmailNotifier } from '@/infrastructure/notifiers/email.notifier';
import { PushNotifier } from '@/infrastructure/notifiers/push.notifier';
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
        // This case should be unreachable if using TypeScript correctly,
        // but it's good practice for robustness.
        throw new Error(`Unknown notifier type: ${type}`);
    }
  }
}
