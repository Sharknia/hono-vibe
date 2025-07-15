import { D1Database } from '@cloudflare/workers-types';
import Database from 'better-sqlite3';
import * as schema from '@/infrastructure/db/schema';
import { IUserRepository } from '@/domain/users/user.repository';
import { User, UserProps } from '@/domain/users/user.entity';
import { eq } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db';

export class DrizzleUserRepository implements IUserRepository {
  private db;

  constructor(env: any) {
    this.db = getDb(env);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    if (!result) return null;
    // Trust Drizzle to map types correctly based on schema
    return User.fromData(result as UserProps);
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    if (!result) return null;
    return User.fromData(result as UserProps);
  }

  async save(user: User): Promise<void> {
    await this.db.insert(schema.users).values(user.props);
  }

  async update(user: User): Promise<void> {
    await this.db.update(schema.users)
      .set(user.props)
      .where(eq(schema.users.id, user.props.id));
  }
}
