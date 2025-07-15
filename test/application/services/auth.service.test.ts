import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/application/services/auth.service';
import { IUserRepository } from '@/domain/users/user.repository';
import { User } from '@/domain/users/user.entity';
import { ConflictError, UnauthorizedError, NotFoundError } from '@/domain/errors';

// Mock UserRepository
const mockUserRepository: IUserRepository = {
  findByEmail: vi.fn(),
  findById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
};

const ACCESS_SECRET = 'test-access-secret';
const REFRESH_SECRET = 'test-refresh-secret';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    authService = new AuthService(mockUserRepository, ACCESS_SECRET, REFRESH_SECRET);
  });

  describe('register', () => {
    it('should throw ConflictError if email is already in use', async () => {
      // Arrange
      const existingUser = await User.create({ email: 'test@example.com', password_plain: 'password123', nickname: null });
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register({ email: 'test@example.com', password: 'password123' }))
        .rejects.toThrow('Email already in use');
    });
  });

  describe('login', () => {
    it('should throw NotFoundError if user does not exist', async () => {
      // Arrange
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login({ email: 'nonexistent@example.com', password: 'password123' }))
        .rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      // Arrange
      const user = await User.create({ email: 'test@example.com', password_plain: 'correct-password', nickname: null });
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);

      // Act & Assert
      await expect(authService.login({ email: 'test@example.com', password: 'wrong-password' }))
        .rejects.toThrow('Invalid credentials');
    });
  });
  
  describe('refresh', () => {
    it('should throw UnauthorizedError for an invalid or revoked token', async () => {
        // Arrange
        const user = await User.create({ email: 'test@example.com', password_plain: 'password123', nickname: null });
        user.props.refreshToken = 'valid-token';
        vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
  
        // Act & Assert
        // Note: We pass a token that is different from the one stored in the user record
        await expect(authService.refresh('different-invalid-token'))
          .rejects.toThrow('Invalid or expired refresh token');
      });
  });
});
