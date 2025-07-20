import type { User } from '@/domain/users/user.entity';
import { NotifierFactory } from '@/application/factories/notifier.factory';
import type { NotifierType } from '@/domain/notifications/notification.strategy';

export class NotificationService {
  public async notify(user: User, message: string): Promise<void> {
    const preferences = user.props.notificationPreferences;

    if (!preferences) {
      return;
    }

    const enabledChannels = Object.entries(preferences)
      .filter(([, isEnabled]) => isEnabled)
      .map(([channel]) => channel as NotifierType);

    if (enabledChannels.length === 0) {
      return;
    }

    const notificationPromises = enabledChannels.map((channel) => {
      const notifier = NotifierFactory.create(channel);
      return notifier.send(user, message);
    });

    await Promise.all(notificationPromises);
  }
}
