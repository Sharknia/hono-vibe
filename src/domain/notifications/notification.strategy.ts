import type { User } from '@/domain/users/user.entity';

export interface NotificationMessage {
  title: string;
  body: string;
  url?: string;
}

export interface INotificationStrategy {
  send(user: User, message: NotificationMessage): Promise<void>;
}
