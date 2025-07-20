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

  describe('save', () => {
    it('should save a new user to the database', async () => {
      // Arrange
      const user = await User.create({ email: 'save-test@example.com', password_plain: 'password', nickname: 'savetest' });

      // Act
      await userRepository.save(user);

      // Assert
      const savedUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, user.props.id),
      });
      expect(savedUser).not.toBeNull();
      expect(savedUser?.id).toBe(user.props.id);
      expect(savedUser?.email).toBe('save-test@example.com');
      expect(savedUser?.nickname).toBe('savetest');
    });
  });

  describe('update', () => {
    it('should update an existing user in the database', async () => {
      // Arrange
      const user = await User.create({ email: 'update-test@example.com', password_plain: 'password', nickname: 'update-me' });
      await userRepository.save(user);

      // Act
      user.props.nickname = 'updated-nickname';
      await userRepository.update(user);

      // Assert
      const updatedUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, user.props.id),
      });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.nickname).toBe('updated-nickname');
    });
  });

  describe('findById and findByEmail', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await User.create({ email: 'find-test@example.com', password_plain: 'password', nickname: 'find-me' });
      await userRepository.save(testUser);
    });

    // Test for findById
    it('findById should return a user if id exists', async () => {
      const foundUser = await userRepository.findById(testUser.props.id);
      expect(foundUser).not.toBeNull();
      expect(foundUser?.props.id).toBe(testUser.props.id);
    });

    it('findById should return null if id does not exist', async () => {
      const foundUser = await userRepository.findById('non-existent-id');
      expect(foundUser).toBeNull();
    });

    // Test for findByEmail
    it('findByEmail should return a user if email exists', async () => {
      const foundUser = await userRepository.findByEmail('find-test@example.com');
      expect(foundUser).not.toBeNull();
      expect(foundUser?.props.email).toBe('find-test@example.com');
    });

    it('findByEmail should return null if email does not exist', async () => {
      const foundUser = await userRepository.findByEmail('non-existent@example.com');
      expect(foundUser).toBeNull();
    });
  });
});
