import { describe, it, expect } from 'vitest';
import type { INotificationStrategy, NotificationMessage } from '@/domain/notifications/notification.strategy';
import type { User } from '@/domain/users/user.entity';

// This is a compile-time test. We are checking if the interface and its methods can be implemented.
describe('INotificationStrategy', () => {
  it('should be implementable by a class', () => {
    class MockNotifier implements INotificationStrategy {
      send(user: User, message: NotificationMessage): Promise<void> {
        // Mock implementation
        console.log(`Sending notification to ${user.props.email} with title: ${message.title}`);
        return Promise.resolve();
      }
    }

    const notifier: INotificationStrategy = new MockNotifier();
    expect(notifier).toBeDefined();
    // This will fail until the 'send' method is defined on the interface
    expect(typeof notifier.send).toBe('function');
  });
});
