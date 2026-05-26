import type { Context } from 'hono'
import { ZodError } from "zod"

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
  unauthorized:  (msg: string = 'Unauthorized') => new AppError(msg, 401),
  forbidden:     (msg: string = 'Forbidden')    => new AppError(msg, 403),
  badRequest:    (msg: string)      => new AppError(msg, 400),
}

export function handleError(e: unknown, c: Context) {

  // Handle Zod validation errors
  if (e instanceof ZodError) {
    return c.json({
      success: false,
      errors: e.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    }, 400)
  }

  // Handle custom AppError
  if (e instanceof AppError) {
    return c.json(
      { success: false, error: e.message },
      e.statusCode as any
    )
  }

  console.error(e)

  return c.json(
    { success: false, error: 'Internal server error' },
    500
  )
}