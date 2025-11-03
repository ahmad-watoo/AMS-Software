import { env } from '@/config/env';

describe('Environment Configuration', () => {
  it('should load environment variables', () => {
    expect(env.nodeEnv).toBeDefined();
    expect(env.port).toBeDefined();
    expect(env.apiVersion).toBeDefined();
  });

  it('should have Supabase configuration', () => {
    expect(env.supabase).toBeDefined();
    expect(env.supabase.url).toBeDefined();
    expect(env.supabase.anonKey).toBeDefined();
    expect(env.supabase.serviceRoleKey).toBeDefined();
  });

  it('should have JWT configuration', () => {
    expect(env.jwt).toBeDefined();
    expect(env.jwt.secret).toBeDefined();
    expect(env.jwt.expiresIn).toBeDefined();
  });

  it('should have CORS configuration', () => {
    expect(env.cors).toBeDefined();
    expect(env.cors.origin).toBeDefined();
  });

  it('should have rate limit configuration', () => {
    expect(env.rateLimit).toBeDefined();
    expect(env.rateLimit.windowMs).toBeDefined();
    expect(env.rateLimit.maxRequests).toBeDefined();
  });
});

