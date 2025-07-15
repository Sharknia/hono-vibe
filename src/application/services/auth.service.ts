import { IUserRepository } from '@/domain/users/user.repository';
import { User } from '@/domain/users/user.entity';
import { sign, verify } from 'hono/jwt';
import {
  DuplicateEmailError,
  DuplicateNicknameError,
  NotFoundError,
  UnauthorizedError,
} from '@/domain/errors';

type SignUpUserDto = {
  email: string;
  password: string;
  nickname: string;
};

type LoginUserDto = {
  email: string;
  password: string;
};

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private readonly accessSecret: string,
    private readonly refreshSecret: string,
  ) {}

  async signUp(dto: SignUpUserDto): Promise<void> {
    const existingUserByEmail = await this.userRepository.findByEmail(dto.email);
    if (existingUserByEmail) {
      throw new DuplicateEmailError();
    }

    const existingUserByNickname = await this.userRepository.findByNickname(dto.nickname);
    if (existingUserByNickname) {
      throw new DuplicateNicknameError();
    }

    const newUser = await User.create({
      email: dto.email,
      password_plain: dto.password,
      nickname: dto.nickname,
    });
    await this.userRepository.save(newUser);
  }

  async login(dto: LoginUserDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await user.comparePassword(dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    const accessToken = await sign({
      sub: user.props.id,
      role: user.props.role,
      exp: Math.floor(Date.now() / 1000) + (15 * 60), 
    }, this.accessSecret);

    const refreshToken = await sign({
      sub: user.props.id,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
    }, this.refreshSecret);

    user.props.refreshToken = refreshToken;
    await this.userRepository.update(user);

    return { accessToken, refreshToken };
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await verify(token, this.refreshSecret);
      if (!payload || !payload.sub) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user || user.props.refreshToken !== token) {
        throw new UnauthorizedError('Invalid or revoked refresh token');
      }

      const newAccessToken = await sign({
        sub: user.props.id,
        role: user.props.role,
        exp: Math.floor(Date.now() / 1000) + (15 * 60),
      }, this.accessSecret);
      
      const newRefreshToken = await sign({
        sub: user.props.id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7),
      }, this.refreshSecret);

      user.props.refreshToken = newRefreshToken;
      await this.userRepository.update(user);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };

    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      // Re-throw JWT errors (like expiration) as a standard UnauthorizedError
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      // This case is unlikely if the auth middleware is working, but good practice.
      throw new NotFoundError('User not found');
    }

    user.props.refreshToken = null;
    await this.userRepository.update(user);
  }
}
