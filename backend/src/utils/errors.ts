import type { Context } from 'hono'
export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

// Common reusable errors
export const Errors = {
  notFound:      (resource: string) => new AppError(`${resource} not found`, 404),
  alreadyExists: (resource: string) => new AppError(`${resource} already exists`, 409),
  unauthorized:  ()                 => new AppError('Unauthorized', 401),
  forbidden:     ()                 => new AppError('Forbidden', 403),
  badRequest:    (msg: string)      => new AppError(msg, 400),
}


export function handleError(e: unknown, c: Context) {
  if (e instanceof AppError) {
    return c.json({ error: e.message }, e.statusCode as any)
  }
  console.error(e)
  return c.json({ error: 'Internal server error' }, 500)
}