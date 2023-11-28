export const IS_NODE = !!process.env.IS_NODE || (typeof window === 'undefined' && typeof global === 'object');
export const IS_VERCEL_RUNTIME = !!process.env.VERCEL;
