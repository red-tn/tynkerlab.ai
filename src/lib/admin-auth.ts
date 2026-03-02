import { Client, Account, Databases, Query } from 'node-appwrite'

/**
 * Verify the request comes from an authenticated admin user.
 * Extracts the Appwrite JWT from the x-appwrite-jwt header,
 * validates it against Appwrite, and checks the user's profile role.
 *
 * @returns The admin's userId
 * @throws Error with 'Unauthorized' or 'Forbidden' message
 */
export async function requireAdmin(request: Request): Promise<{ userId: string }> {
  const jwt = request.headers.get('x-appwrite-jwt')
  if (!jwt) {
    throw new AdminAuthError('Unauthorized', 401)
  }

  // Verify JWT with Appwrite
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setJWT(jwt)

  const userAccount = new Account(client)
  let user
  try {
    user = await userAccount.get()
  } catch {
    throw new AdminAuthError('Unauthorized', 401)
  }

  // Check admin role via admin client (profile docs may not be readable by user)
  const adminClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)

  const databases = new Databases(adminClient)
  const profiles = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    'profiles',
    [Query.equal('userId', user.$id), Query.limit(1)]
  )

  if (!profiles.documents[0] || profiles.documents[0].role !== 'admin') {
    throw new AdminAuthError('Forbidden', 403)
  }

  return { userId: user.$id }
}

export class AdminAuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
