import type { INotificationStrategy, NotificationMessage } from '@/domain/notifications/notification.strategy';
import type { User } from '@/domain/users/user.entity';

export class EmailNotifier implements INotificationStrategy {
  async send(user: User, message: NotificationMessage): Promise<void> {
    // In a real application, this would use an email service (e.g., SendGrid, SES)
    console.log(`[Email] Sending notification to ${user.props.email}: ${message.title}`);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
