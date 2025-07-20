import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export type UserProps = {
  id: string;
  email: string;
  passwordHash: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  notificationPreferences?: { email?: boolean; push?: boolean };
  pushToken?: string | null;
};

export class User {
  private constructor(public props: UserProps) {}

  public static async create(
    params: Pick<UserProps, 'email' | 'nickname'> & { password_plain: string }
  ): Promise<User> {
    const passwordHash = await hash(params.password_plain, 10);
    const now = new Date();
    return new User({
      id: uuidv4(),
      email: params.email,
      passwordHash,
      nickname: params.nickname,
      role: 'USER',
      refreshToken: null,
      createdAt: now,
      updatedAt: now,
      notificationPreferences: { email: true, push: true }, // Default preferences
      pushToken: null,
    });
  }

  public async comparePassword(password_plain: string): Promise<boolean> {
    return compare(password_plain, this.props.passwordHash);
  }
  
  public static fromData(data: UserProps): User {
    return new User(data);
  }

  public toProfile() {
    const { passwordHash, refreshToken, createdAt, updatedAt, notificationPreferences, pushToken, ...profile } = this.props;
    return profile;
  }
}
