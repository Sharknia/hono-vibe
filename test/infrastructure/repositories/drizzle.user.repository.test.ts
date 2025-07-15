import { describe, it, expect, beforeAll, afterEach, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/infrastructure/db/schema';
import { DrizzleUserRepository } from '@/infrastructure/repositories/drizzle.user.repository';
import { User } from '@/domain/users/user.entity';

const sqlite = new Database(':memory:');
const db = drizzle(sqlite, { schema });

describe('DrizzleUserRepository', () => {
  let userRepository: DrizzleUserRepository;

  beforeAll(() => {
    migrate(db, { migrationsFolder: './drizzle' });
    const testEnv = { VITEST_DB: sqlite };
    userRepository = new DrizzleUserRepository(testEnv);
  });

  afterEach(async () => {
    await db.delete(schema.users);
  });

  describe('findByNickname', () => {
    it('should return a user if nickname exists', async () => {
      // Arrange
      const user = await User.create({ email: 'test@example.com', password_plain: 'password', nickname: 'testuser' });
      await userRepository.save(user);

      // Act
      const foundUser = await userRepository.findByNickname('testuser');

      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser?.props.id).toBe(user.props.id);
      expect(foundUser?.props.nickname).toBe('testuser');
    });

    it('should return null if nickname does not exist', async () => {
      // Act
      const foundUser = await userRepository.findByNickname('nonexistent');

      // Assert
      expect(foundUser).toBeNull();
    });
  });
});
