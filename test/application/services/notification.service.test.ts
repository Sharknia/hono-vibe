import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '@/application/services/notification.service';
import { User } from '@/domain/users/user.entity';
import { NotifierFactory } from '@/application/factories/notifier.factory';
import { EmailNotifier } from '@/infrastructure/notifiers/email.notifier';
import { PushNotifier } from '@/infrastructure/notifiers/push.notifier';

describe('NotificationService', () => {
  let user: User;
  const message = 'Test message';

  // Declare spies
  let createSpy: vi.SpyInstance;
  let emailSendSpy: vi.SpyInstance;
  let pushSendSpy: vi.SpyInstance;

  beforeEach(() => {
    // Restore all mocks before each test to ensure clean slate
    vi.restoreAllMocks();

    // Spy on the factory's create method to see if it's called correctly
    createSpy = vi.spyOn(NotifierFactory, 'create');

    // Spy on the send methods of the notifiers to verify they are called
    emailSendSpy = vi.spyOn(EmailNotifier.prototype, 'send').mockResolvedValue(undefined);
    pushSendSpy = vi.spyOn(PushNotifier.prototype, 'send').mockResolvedValue(undefined);
  });

  it('should send notifications via all enabled channels (email and push)', async () => {
    // Arrange
    user = await User.create({ email: 'test@example.com', nickname: 'tester', password_plain: 'password123' });
    user.props.notificationPreferences = { email: true, push: true };
    const notificationService = new NotificationService();

    // Act
    await notificationService.notify(user, message);

    // Assert
    expect(createSpy).toHaveBeenCalledWith('email');
    expect(createSpy).toHaveBeenCalledWith('push');
    expect(emailSendSpy).toHaveBeenCalledOnce();
    expect(emailSendSpy).toHaveBeenCalledWith(user, message);
    expect(pushSendSpy).toHaveBeenCalledOnce();
    expect(pushSendSpy).toHaveBeenCalledWith(user, message);
  });

  it('should send notifications only via email when only email is enabled', async () => {
    // Arrange
    user = await User.create({ email: 'test@example.com', nickname: 'tester', password_plain: 'password123' });
    user.props.notificationPreferences = { email: true, push: false };
    const notificationService = new NotificationService();

    // Act
    await notificationService.notify(user, message);

    // Assert
    expect(createSpy).toHaveBeenCalledWith('email');
    expect(createSpy).not.toHaveBeenCalledWith('push');
    expect(emailSendSpy).toHaveBeenCalledOnce();
    expect(emailSendSpy).toHaveBeenCalledWith(user, message);
    expect(pushSendSpy).not.toHaveBeenCalled();
  });

  it('should not send any notifications if all channels are disabled', async () => {
    // Arrange
    user = await User.create({ email: 'test@example.com', nickname: 'tester', password_plain: 'password123' });
    user.props.notificationPreferences = { email: false, push: false };
    const notificationService = new NotificationService();

    // Act
    await notificationService.notify(user, message);

    // Assert
    expect(createSpy).not.toHaveBeenCalled();
    expect(emailSendSpy).not.toHaveBeenCalled();
    expect(pushSendSpy).not.toHaveBeenCalled();
  });

  it('should not send any notifications if preferences are not set', async () => {
    // Arrange
    user = await User.create({ email: 'test@example.com', nickname: 'tester', password_plain: 'password123' });
    // Note: user.props.notificationPreferences is now initialized with defaults
    user.props.notificationPreferences = {}; // Explicitly set to empty for this test
    const notificationService = new NotificationService();

    // Act
    await notificationService.notify(user, message);

    // Assert
    expect(createSpy).not.toHaveBeenCalled();
    expect(emailSendSpy).not.toHaveBeenCalled();
    expect(pushSendSpy).not.toHaveBeenCalled();
  });
});
