import { IUserRepository } from '@/domain/users/user.repository';
import { User } from '@/domain/users/user.entity';
import { sign, verify } from 'hono/jwt';

type RegisterUserDto = {
  email: string;
  password: string;
};

type LoginUserDto = {
  email: string;
  password: string;
};

type ServiceResponse = {
  success: boolean;
  data?: any;
  message: string;
  statusCode: number;
}

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private readonly accessSecret: string,
    private readonly refreshSecret: string,
  ) {}

  async register(dto: RegisterUserDto): Promise<ServiceResponse> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      return { success: false, message: 'Email already in use', statusCode: 409 };
    }

    try {
      const newUser = await User.create({
        email: dto.email,
        password_plain: dto.password,
        nickname: null,
      });
      await this.userRepository.save(newUser);
      return { success: true, message: 'User created successfully', statusCode: 201 };
    } catch (error) {
      return { success: false, message: 'Failed to create user', statusCode: 500 };
    }
  }

  async login(dto: LoginUserDto): Promise<ServiceResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      return { success: false, message: 'User not found', statusCode: 404 };
    }

    const isPasswordValid = await user.comparePassword(dto.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid credentials', statusCode: 401 };
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

    return { 
      success: true, 
      data: { accessToken, refreshToken },
      message: 'Login successful', 
      statusCode: 200 
    };
  }

  async refresh(token: string): Promise<ServiceResponse> {
    try {
      const payload = await verify(token, this.refreshSecret);
      if (!payload || !payload.sub) {
        return { success: false, message: 'Invalid refresh token', statusCode: 401 };
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user || user.props.refreshToken !== token) {
        return { success: false, message: 'Invalid or revoked refresh token', statusCode: 401 };
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

      return { 
        success: true, 
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        message: 'Tokens refreshed successfully', 
        statusCode: 200 
      };

    } catch (error) {
      return { success: false, message: 'Invalid or expired refresh token', statusCode: 401 };
    }
  }
}