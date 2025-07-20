import { describe, it, expect } from 'vitest';
import { NotifierFactory } from '@/infrastructure/notifiers/notifier.factory';
import { EmailNotifier } from '@/infrastructure/notifiers/email.notifier';
import { PushNotifier } from '@/infrastructure/notifiers/push.notifier';

describe('NotifierFactory', () => {
  it('should return an instance of EmailNotifier for type "email"', () => {
    const notifier = NotifierFactory.create('email');
    expect(notifier).toBeInstanceOf(EmailNotifier);
  });

  it('should return an instance of PushNotifier for type "push"', () => {
    const notifier = NotifierFactory.create('push');
    expect(notifier).toBeInstanceOf(PushNotifier);
  });

  it('should throw an error for an unknown notifier type', () => {
    // @ts-expect-error: Testing invalid input
    expect(() => NotifierFactory.create('sms')).toThrow('Unknown notifier type: sms');
  });
});
