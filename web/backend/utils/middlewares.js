import { atobJsonParse } from './index.js'
/** @typedef {import('express')} express */

/**
 * `state` is passed from the frontend encoded as `bta(JSON.stringiify({ shop: '', host: '', ... }))`
 *  It consists of all the base params which are set by shopify on the first load
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export function decodeStateMiddleware(req, res, next) {
  res.locals.shopify_state = atobJsonParse(req.query.state)
  next()
}

/**
 *
 * @param {unknown} error
 * @param {express.Request} _req
 * @param {express.Response} res
 * @param {express.NextFunction} _next
 */
export function errorHandler(error, _req, res, _next) {
  console.error(err.stack)
  res.status(500).json({
    ok: false,
    status: 500,
    message: 'Internal server error',
    error: err?.message,
    issues: error instanceof ZodError ? error.issues : undefined,
  })
}
