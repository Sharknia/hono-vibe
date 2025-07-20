import type { INotificationStrategy, NotificationMessage } from '@/domain/notifications/notification.strategy';
import type { User } from '@/domain/users/user.entity';

export class PushNotifier implements INotificationStrategy {
  async send(user: User, message: NotificationMessage): Promise<void> {
    if (!user.props.pushToken) {
      console.log(`[Push] User ${user.props.nickname} has no push token. Skipping.`);
      return;
    }

    // In a real application, this would use a push notification service (e.g., FCM, APNs)
    console.log(`[Push] Sending notification to token ${user.props.pushToken}: ${message.title}`);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
