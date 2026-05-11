const assert = require('assert');

require('ts-node/register/transpile-only');
const { middleware } = require('../middleware.ts');

(async () => {
  // Ensure env missing causes redirect to /login
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const req = {
    nextUrl: { pathname: '/admin' },
    url: 'http://localhost/admin',
    cookies: {
      getAll() {
        return [];
      },
      set() {},
    },
  };

  try {
    const res = await middleware(req);
    const location = res?.headers?.get?.('location') || null;
    assert(location && location.endsWith('/login'), `Expected redirect to /login, got ${location}`);
    console.log('middleware smoke test passed');
    process.exit(0);
  } catch (err) {
    console.error('middleware smoke test failed', err);
    process.exit(1);
  }
})();
