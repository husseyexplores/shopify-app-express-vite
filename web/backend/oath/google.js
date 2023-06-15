import jwt from 'jsonwebtoken'
import * as db from '../db/index.js'
import { env } from '../env.js'
import { atobJsonParse } from '../utils/index.js'

const rootUrl = `https://accounts.google.com/o/oauth2/v2/auth`

/*
-> console: `https://console.cloud.google.com/apis/credentials/oauthclient/764183731151-0cuofr6smcd75gicbge4deadpuqu2ttj.apps.googleusercontent.com?authuser=1&project=n74-custom-reports`

-> remove personal: `https://myaccount.google.com/u/2/permissions?continue=https%3A%2F%2Fmyaccount.google.com%2Fu%2F2%2Fsecurity%3FpageId%3Dnone`

*/

const scope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
].join(' ')

const sp = new URLSearchParams({
  redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI.fullUri,
  client_id: env.GOOGLE_CLIENT_ID,
  access_type: 'offline',
  response_type: 'code',
  prompt: 'consent',
  scope,
})

console.log('google redirect_uri =>', env.GOOGLE_OAUTH_REDIRECT_URI.fullUri)

export const OAuthUrl = `${rootUrl}?${sp.toString()}`

/** @type {import('express').RequestHandler}  */
export const callback = async function googleOauthCallback(req, res) {
  // get the code from qs
  /** @type {string} */
  const code = req.query.code

  // get the id and access token with code
  const tokens = await fetchGoogleOAuthTokens(code)
  console.log('tokens => \n', tokens, '\n--- x --- x --- x ---\n')

  // get the user with token
  const decodedGoogleUser = jwt.decode(tokens.id_token)
  const fetchedGoogleUser = await fetchGoogleUser(
    tokens.id_token,
    tokens.access_token,
  )
  console.log({ decodedGoogleUser })
  console.log({ fetchedGoogleUser })

  if (fetchedGoogleUser.verified_email === false) {
    console.error('oops. Email not verified')
    return res.status(400).json({
      ok: false,
      error: 'Email not verified',
    })
  }

  // upsert user into db

  /** @type {string} */
  const encodedState = req.query.state
  const state = atobJsonParse(encodedState)
  const shop = state.shop
  if (shop) {
    await db.shops.update(shop, {
      googleAuthInfo: {
        tokens,
        decoded: decodedGoogleUser,
        fetched: fetchedGoogleUser,
      },
    })
  }

  // create access & refresh tokens

  // set cookie

  // redirect back to client
  const sp = new URLSearchParams(state)
  res.redirect(`${env.HOST}?${sp.toString()}`)
}

/**
 *
 * @param {string} code
 * @returns {Promise<import('../types').GoogleOAuthTokens>}
 */
async function fetchGoogleOAuthTokens(code) {
  const sp = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URI.fullUri,
    grant_type: 'authorization_code',
  })

  try {
    return await fetch(`https://oauth2.googleapis.com/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sp.toString(),
    }).then(r => {
      if (!r.ok) {
        throw new Error(`${r.statusText} (${r.status})`)
      }

      return r.json()
    })
  } catch (e) {
    console.log('Failed to fetch google oauth tokens', e)
    throw e
  }
}

/**
 *
 * @param {string} idToken
 * @param {string} accessToken
 * @returns {Promise<import('../types').GoogleUser>}
 */
async function fetchGoogleUser(id_token, access_token) {
  try {
    const googleUser = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        accept: 'application/json',
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      },
    ).then(r => r.json())
    return googleUser
  } catch (e) {
    throw e
  }
}
