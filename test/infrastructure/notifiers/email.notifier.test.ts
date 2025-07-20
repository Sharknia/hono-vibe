import { describe, it, expect, vi } from 'vitest';
import { EmailNotifier } from '@/infrastructure/notifiers/email.notifier';
import type { INotificationStrategy, NotificationMessage } from '@/domain/notifications/notification.strategy';
import { User } from '@/domain/users/user.entity';

describe('EmailNotifier', () => {
  it('should implement INotificationStrategy and have a send method', async () => {
    // Arrange
    const notifier: INotificationStrategy = new EmailNotifier();
    const user = await User.create({ email: 'test@example.com', password_plain: 'password', nickname: 'testuser' });
    const message: NotificationMessage = {
      title: 'Test Email',
      body: 'This is a test email notification.',
    };

    // Mock console.log to verify output
    const consoleSpy = vi.spyOn(console, 'log');

    // Act
    await notifier.send(user, message);

    // Assert
    expect(notifier).toBeDefined();
    expect(typeof notifier.send).toBe('function');
    expect(consoleSpy).toHaveBeenCalledWith(
      `[Email] Sending notification to ${user.props.email}: ${message.title}`
    );

    // Clean up
    consoleSpy.mockRestore();
  });
});
