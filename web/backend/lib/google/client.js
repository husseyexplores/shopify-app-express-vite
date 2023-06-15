import gd, { drive_v3 } from '@googleapis/drive'
import sh from '@googleapis/sheets'

const oauth2Client = new gd.auth.OAuth2({
  clientId: '',
  clientSecret: '',
})
oauth2Client.setCredentials({
  access_token: '',
  refresh_token: '',
  id_token: '',
  scope:
    'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/drive.file',
  token_type: 'Bearer',
})

/*
Needed scopes:
[
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
]
*/

export async function getDrive() {
  const udrive = new drive_v3.Drive({
    auth: oauth2Client,
  })

  const sheets = new sh.sheets_v4.Sheets({
    auth: oauth2Client,
  })

  const tokens = await oauth2Client.refreshAccessToken()
  oauth2Client.setCredentials(tokens.credentials)

  return { drive: udrive, sheets }
}
