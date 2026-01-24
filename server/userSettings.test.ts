import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';
import { getDb } from './db';
import { users, userSettings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('userSettings router', () => {
  let testUserId: number;
  
  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    // Create test user
    const [result] = await db.insert(users).values({
      openId: 'test-user-settings-' + Date.now(),
      name: 'Test User Settings',
      email: 'test-settings@example.com',
      role: 'user',
      loginMethod: 'test',
    });
    
    // Get the inserted user ID
    const inserted = await db.select().from(users).where(eq(users.openId, 'test-user-settings-' + Date.now())).limit(1);
    testUserId = inserted[0]?.id || result.insertId;
  });
  
  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    
    // Clean up test data
    await db.delete(userSettings).where(eq(userSettings.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });
  
  const getMockContext = (): Context => ({
    user: {
      id: testUserId,
      openId: 'test-user-settings',
      name: 'Test User Settings',
      email: 'test-settings@example.com',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: 'test',
    },
    req: {} as any,
    res: {} as any,
  });

  it('should create default settings on first get', async () => {
    const caller = appRouter.createCaller(getMockContext());
    const settings = await caller.userSettings.get();
    
    expect(settings).toBeDefined();
    expect(settings.userId).toBe(testUserId);
    expect(settings.defaultVolatility).toBe('0.15'); // 15%
    expect(settings.defaultRiskFreeRate).toBe('0.02'); // 2%
    expect(settings.defaultMultiplier).toBe(5);
  });

  it('should update user settings', async () => {
    const caller = appRouter.createCaller(getMockContext());
    const updated = await caller.userSettings.update({
      defaultVolatility: '0.20', // 20%
      defaultRiskFreeRate: '0.03', // 3%
      defaultMultiplier: 1,
    });

    expect(updated).toBeDefined();
    expect(updated.defaultVolatility).toBe('0.20');
    expect(updated.defaultRiskFreeRate).toBe('0.03');
    expect(updated.defaultMultiplier).toBe(1);
  });

  it('should persist updated settings', async () => {
    const caller = appRouter.createCaller(getMockContext());
    const settings = await caller.userSettings.get();
    
    expect(settings.defaultVolatility).toBe('0.20');
    expect(settings.defaultRiskFreeRate).toBe('0.03');
    expect(settings.defaultMultiplier).toBe(1);
  });

  it('should allow partial updates', async () => {
    const caller = appRouter.createCaller(getMockContext());
    // Update only volatility
    await caller.userSettings.update({
      defaultVolatility: '0.25',
    });

    const settings = await caller.userSettings.get();
    expect(settings.defaultVolatility).toBe('0.25');
    // Other fields should remain unchanged
    expect(settings.defaultRiskFreeRate).toBe('0.03');
    expect(settings.defaultMultiplier).toBe(1);
  });
});
