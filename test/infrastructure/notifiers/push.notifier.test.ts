import { describe, it, expect, vi } from 'vitest';
import { PushNotifier } from '@/infrastructure/notifiers/push.notifier';
import type { INotificationStrategy, NotificationMessage } from '@/domain/notifications/notification.strategy';
import { User } from '@/domain/users/user.entity';

describe('PushNotifier', () => {
  it('should implement INotificationStrategy and have a send method', async () => {
    // Arrange
    const notifier: INotificationStrategy = new PushNotifier();
    const user = await User.create({ email: 'test@example.com', password_plain: 'password', nickname: 'testuser' });
    user.props.pushToken = 'test-push-token';
    const message: NotificationMessage = {
      title: 'Test Push',
      body: 'This is a test push notification.',
    };

    // Mock console.log to verify output
    const consoleSpy = vi.spyOn(console, 'log');

    // Act
    await notifier.send(user, message);

    // Assert
    expect(notifier).toBeDefined();
    expect(typeof notifier.send).toBe('function');
    expect(consoleSpy).toHaveBeenCalledWith(
      `[Push] Sending notification to token ${user.props.pushToken}: ${message.title}`
    );

    // Clean up
    consoleSpy.mockRestore();
  });

  it('should not send if user has no push token', async () => {
    // Arrange
    const notifier: INotificationStrategy = new PushNotifier();
    const user = await User.create({ email: 'no-token@example.com', password_plain: 'password', nickname: 'no-token-user' });
    const message: NotificationMessage = {
      title: 'Test Push',
      body: 'This should not be sent.',
    };
    const consoleSpy = vi.spyOn(console, 'log');

    // Act
    await notifier.send(user, message);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(
      `[Push] User ${user.props.nickname} has no push token. Skipping.`
    );
    
    consoleSpy.mockRestore();
  });
});
