import { cookies } from 'next/headers';
import { MockDB } from '../mock-db/db';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { users: [], profiles: [] };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function createClient() {
  const cookieStore = cookies();
  const COOKIE_NAME = 'maaun-mock-auth';

  const auth = {
    async signInWithPassword({ email, password }: any) {
      const db = readDB();
      const user = db.users?.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        cookieStore.set(COOKIE_NAME, user.id, { path: '/' });
        return { data: { user }, error: null };
      }
      return { data: null, error: { message: 'Invalid login credentials' } };
    },

    async signUp({ email, password, options }: any) {
      const db = readDB();
      const existingUser = db.users?.find((u: any) => u.email === email);
      if (existingUser) {
        return { data: null, error: { message: 'User already exists' } };
      }

      const newUser = { id: crypto.randomUUID(), email, password };
      const newProfile = {
        id: newUser.id,
        full_name: options?.data?.full_name || 'New User',
        role: 'student',
        department_id: null,
        created_at: new Date().toISOString()
      };

      db.users = [...(db.users || []), newUser];
      db.profiles = [...(db.profiles || []), newProfile];
      writeDB(db);

      cookieStore.set(COOKIE_NAME, newUser.id, { path: '/' });
      return { data: { session: true, user: newUser }, error: null };
    },

    async signOut() {
      cookieStore.delete(COOKIE_NAME);
      return { error: null };
    },

    async getUser() {
      const userId = cookieStore.get(COOKIE_NAME)?.value;
      if (!userId) return { data: { user: null }, error: { message: 'No session' } };

      const db = readDB();
      const user = db.users?.find((u: any) => u.id === userId);
      
      if (user) {
        return { data: { user }, error: null };
      }
      return { data: { user: null }, error: { message: 'User not found' } };
    },

    admin: {
      async listUsers() {
        const db = readDB();
        return { data: { users: db.users || [] }, error: null };
      },
      async updateUserById(id: string, attributes: any) {
        const db = readDB();
        const userIndex = db.users?.findIndex((u: any) => u.id === id);
        if (userIndex !== undefined && userIndex !== -1) {
          db.users[userIndex] = { ...db.users[userIndex], ...attributes };
          writeDB(db);
          return { data: { user: db.users[userIndex] }, error: null };
        }
        return { data: null, error: { message: 'User not found' } };
      }
    }
  };

  return {
    from: MockDB.from,
    auth
  };
}

export function createAdminClient() {
  // Admin client bypasses RLS, but in our mock we don't have RLS anyway.
  return createClient();
}
