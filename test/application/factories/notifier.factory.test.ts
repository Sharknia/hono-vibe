import { describe, it, expect } from 'vitest';
import { NotifierFactory } from '@/application/factories/notifier.factory';
import { EmailNotifier } from '@/infrastructure/notifiers/email.notifier';
import { PushNotifier } from '@/infrastructure/notifiers/push.notifier';
import type { INotificationStrategy } from '@/domain/notifications/notification.strategy';

describe('NotifierFactory', () => {
  it('should create an EmailNotifier for "email" type', () => {
    const notifier: INotificationStrategy = NotifierFactory.create('email');
    expect(notifier).toBeInstanceOf(EmailNotifier);
  });

  it('should create a PushNotifier for "push" type', () => {
    const notifier: INotificationStrategy = NotifierFactory.create('push');
    expect(notifier).toBeInstanceOf(PushNotifier);
  });

  it('should throw an error for an unknown notifier type', () => {
    expect(() => {
      NotifierFactory.create('sms' as any);
    }).toThrow('Unknown notifier type: sms');
  });
});
