import { ZodError } from 'zod'

/**
 *
 * @param {unknown} state
 */
export function atobJsonParse(encodedState) {
  if (typeof encodedState === 'string') {
    try {
      const decodedState = Buffer.from(encodedState, 'base64').toString('utf-8')
      const state = JSON.parse(decodedState)
      return state
    } catch (e) {
      throw new Error('Failed to parse `state` query param')
    }
  }

  throw new Error('`state` is missing from query params')
}

/**
 * @template {import('zod').AnyZodObject} T
 * @param {T} schema
 * @param {import('express').Request} req
 * @returns {import('zod').infer<T>}
 */
export async function zParse(schema, req) {
  try {
    return schema.parseAsync(req)
  } catch (error) {
    if (error instanceof ZodError) {
      throw badRequest(error.message)
    }
    return badRequest(JSON.stringify(error))
  }
}

/**
 * @typedef {import('zod').ZodSchema} ZodSchema
 */

/**
 * @template {ZodSchema<any>} T
 * @param {T} schema
 * @param {unknown} input
 * @returns {input is T['_type']}
 */
export function schemaMatches(schema, input) {
  const result = schema.safeParse(input)
  if (result.success) return true
  return false
}

/**
 * @template {Promise<any>} T
 * @param {T} promise
 * @returns {Promise<[Awaited<T>, null] | [null, unknown]>}
 */
export async function to(promise) {
  try {
    let data = await promise

    /** @type {[Awaited<T>, null]} */
    const result = [data, null]
    return result
  } catch (error) {
    /** @type {[null, unknown]} */
    const result = [null, error]
    return result
  }
}
