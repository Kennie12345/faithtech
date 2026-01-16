/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js at server startup.
 * Use it to initialize global systems, register event listeners,
 * and set up monitoring.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initialize } = await import('@/lib/core/init');
    initialize();
  }
}
