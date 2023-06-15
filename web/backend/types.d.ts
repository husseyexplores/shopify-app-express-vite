export async function FirestoreBatchedHelper(
  documentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  action: 'delete',
): Promise<true>

export async function FirestoreBatchedHelper(
  documentsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  action: 'update' | 'set',
  update:
    | Record<string, any>
    | ((
        doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
      ) => Record<string, any>),
): Promise<true>

export type GoogleOAuthTokens = {
  id_token: string
  access_token: string
  refresh_token: string
  token_type: string // 'Bearer' | string
  scope: string
  expires_in: number
}

export type GoogleUser = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}