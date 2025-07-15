import { describe, it, expect } from 'vitest';
import { User } from '@/domain/users/user.entity';

describe('User Entity', () => {
  it('should create a user profile without sensitive data using toProfile', async () => {
    // Arrange
    const user = await User.create({
      email: 'profile-test@example.com',
      password_plain: 'password123',
      nickname: 'tester',
    });
    user.props.refreshToken = 'a-refresh-token';

    // Act
    const profile = user.toProfile();

    // Assert
    expect(profile).toEqual({
      id: user.props.id,
      email: 'profile-test@example.com',
      nickname: 'tester',
      role: 'USER',
    });
    expect(profile).not.toHaveProperty('passwordHash');
    expect(profile).not.toHaveProperty('refreshToken');
  });
});
