import { z } from 'zod';

// Imported first in main.ts: Zod reads `jitless` when a schema is built, and ES imports
// run before main.ts's body, so this must run before any module that creates a schema.
z.config(z.locales.fr());
// The CSP forbids eval: skip Zod's new Function() probe (JIT parsers), which logs a CSP violation
z.config({ jitless: true });
