import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/application/services/auth.service';
import { IUserRepository } from '@/domain/users/user.repository';
import { User } from '@/domain/users/user.entity';
import {
  DuplicateEmailError,
  DuplicateNicknameError,
  UnauthorizedError,
  NotFoundError,
} from '@/domain/errors';

// Mock UserRepository
const mockUserRepository: IUserRepository = {
  findByEmail: vi.fn(),
  findByNickname: vi.fn(),
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

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.findByNickname).mockResolvedValue(null);
      const dto = { email: 'new@example.com', password: 'password123', nickname: 'newuser' };

      // Act
      await authService.signUp(dto);

      // Assert
      expect(mockUserRepository.save).toHaveBeenCalledOnce();
      const savedUser = vi.mocked(mockUserRepository.save).mock.calls[0][0];
      expect(savedUser.props.email).toBe(dto.email);
      expect(savedUser.props.nickname).toBe(dto.nickname);
    });

    it('should throw DuplicateEmailError if email is already in use', async () => {
      // Arrange
      const existingUser = await User.create({ email: 'test@example.com', password_plain: 'password123', nickname: 'testuser' });
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);
      const dto = { email: 'test@example.com', password: 'password123', nickname: 'newuser' };

      // Act & Assert
      await expect(authService.signUp(dto)).rejects.toThrow(new DuplicateEmailError());
    });

    it('should throw DuplicateNicknameError if nickname is already in use', async () => {
      // Arrange
      const existingUser = await User.create({ email: 'other@example.com', password_plain: 'password123', nickname: 'testuser' });
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockUserRepository.findByNickname).mockResolvedValue(existingUser);
      const dto = { email: 'new@example.com', password: 'password123', nickname: 'testuser' };

      // Act & Assert
      await expect(authService.signUp(dto)).rejects.toThrow(new DuplicateNicknameError());
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
      const user = await User.create({ email: 'test@example.com', password_plain: 'correct-password', nickname: 'testuser' });
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);

      // Act & Assert
      await expect(authService.login({ email: 'test@example.com', password: 'wrong-password' }))
        .rejects.toThrow('Invalid credentials');
    });
  });
  
  describe('refresh', () => {
    it('should throw UnauthorizedError for an invalid or revoked token', async () => {
        // Arrange
        const user = await User.create({ email: 'test@example.com', password_plain: 'password123', nickname: 'testuser' });
        user.props.refreshToken = 'valid-token';
        vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
  
        // Act & Assert
        // Note: We pass a token that is different from the one stored in the user record
        await expect(authService.refresh('different-invalid-token'))
          .rejects.toThrow('Invalid or expired refresh token');
      });
  });
});
