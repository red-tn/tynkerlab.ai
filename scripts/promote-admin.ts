/**
 * Promote a user to admin role.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts <userId-or-email>
 *
 * Requires APPWRITE_API_KEY, NEXT_PUBLIC_APPWRITE_ENDPOINT,
 * NEXT_PUBLIC_APPWRITE_PROJECT_ID, and NEXT_PUBLIC_APPWRITE_DATABASE_ID
 * environment variables (reads from .env.local automatically).
 */

import 'dotenv/config'
import { Client, Databases, Query, Users } from 'node-appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error('Missing required environment variables. Ensure .env.local is configured.')
  process.exit(1)
}

const identifier = process.argv[2]
if (!identifier) {
  console.error('Usage: npx tsx scripts/promote-admin.ts <userId-or-email>')
  process.exit(1)
}

async function main() {
  const client = new Client()
    .setEndpoint(endpoint!)
    .setProject(projectId!)
    .setKey(apiKey!)

  const databases = new Databases(client)
  const users = new Users(client)

  let userId = identifier

  // If it looks like an email, resolve to userId
  if (identifier.includes('@')) {
    console.log(`Looking up user by email: ${identifier}`)
    const userList = await users.list([Query.equal('email', identifier)])
    if (userList.users.length === 0) {
      console.error(`No user found with email: ${identifier}`)
      process.exit(1)
    }
    userId = userList.users[0].$id
    console.log(`Found user: ${userList.users[0].name} (${userId})`)
  }

  // Find profile document
  const profiles = await databases.listDocuments(databaseId!, 'profiles', [
    Query.equal('userId', userId),
    Query.limit(1),
  ])

  if (profiles.documents.length === 0) {
    console.error(`No profile document found for userId: ${userId}`)
    console.error('Make sure the user has signed up and has a profile.')
    process.exit(1)
  }

  const profile = profiles.documents[0]
  console.log(`Current role: ${profile.role}`)

  if (profile.role === 'admin') {
    console.log('User is already an admin. No changes made.')
    process.exit(0)
  }

  // Update role to admin
  await databases.updateDocument(databaseId!, 'profiles', profile.$id, {
    role: 'admin',
  })

  console.log(`Successfully promoted ${profile.fullName || profile.email || userId} to admin!`)
  console.log('The user can now access /admin after logging in.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
