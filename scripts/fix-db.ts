/**
 * Fix Appwrite DB:
 * 1. Add missing attributes to profiles and prompts collections
 * 2. Create profile documents for any auth users who don't have one
 * 3. Grant 50 free credits to all free accounts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Client, Databases, Users, ID, Query } from 'node-appwrite'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)

const databases = new Databases(client)
const users = new Users(client)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!

async function tryCreateAttr(collectionId: string, fn: () => Promise<any>, name: string) {
  try {
    await fn()
    console.log(`  ✓ Created ${name}`)
  } catch (err: any) {
    if (err.message?.includes('already exists') || err.code === 409) {
      console.log(`  - ${name} already exists, skipping`)
    } else {
      console.log(`  ✗ Failed ${name}: ${err.message}`)
    }
  }
}

async function addMissingAttributes() {
  console.log('\n=== Adding missing attributes ===\n')

  // Profiles: bio, location, website
  console.log('Profiles collection:')
  await tryCreateAttr('profiles', () =>
    databases.createStringAttribute(DATABASE_ID, 'profiles', 'bio', 500, false),
    'bio'
  )
  await tryCreateAttr('profiles', () =>
    databases.createStringAttribute(DATABASE_ID, 'profiles', 'location', 100, false),
    'location'
  )
  await tryCreateAttr('profiles', () =>
    databases.createUrlAttribute(DATABASE_ID, 'profiles', 'website', false),
    'website'
  )

  // Wait for attributes to be available
  console.log('  (waiting 3s for attribute indexing...)')
  await new Promise(r => setTimeout(r, 3000))

  // Prompts: submissionStatus, submittedBy, submitterName
  console.log('\nPrompts collection:')
  await tryCreateAttr('prompts', () =>
    databases.createEnumAttribute(DATABASE_ID, 'prompts', 'submissionStatus', ['pending', 'approved', 'rejected', 'admin'], false, 'admin'),
    'submissionStatus'
  )
  await tryCreateAttr('prompts', () =>
    databases.createStringAttribute(DATABASE_ID, 'prompts', 'submittedBy', 36, false),
    'submittedBy'
  )
  await tryCreateAttr('prompts', () =>
    databases.createStringAttribute(DATABASE_ID, 'prompts', 'submitterName', 100, false),
    'submitterName'
  )

  console.log('  (waiting 3s for attribute indexing...)')
  await new Promise(r => setTimeout(r, 3000))
}

async function createMissingProfiles() {
  console.log('\n=== Creating missing profiles ===\n')

  // Get all auth users
  const userList = await users.list([Query.limit(100)])
  console.log(`Found ${userList.total} auth users`)

  for (const user of userList.users) {
    // Check if profile exists
    const existing = await databases.listDocuments(DATABASE_ID, 'profiles', [
      Query.equal('userId', user.$id),
      Query.limit(1),
    ])

    if (existing.documents.length > 0) {
      const profile = existing.documents[0]
      console.log(`  - ${user.email}: profile exists (${profile.creditsBalance} credits, role: ${profile.role})`)

      // Grant 50 credits if they have 0
      if (profile.creditsBalance === 0) {
        await databases.updateDocument(DATABASE_ID, 'profiles', profile.$id, {
          creditsBalance: 50,
          creditsMonthly: 50,
        })
        console.log(`    → Granted 50 free credits`)
      }
      continue
    }

    // Create profile for this user
    console.log(`  + Creating profile for ${user.email}...`)
    await databases.createDocument(DATABASE_ID, 'profiles', ID.unique(), {
      userId: user.$id,
      email: user.email,
      fullName: user.name || null,
      role: 'user',
      creditsBalance: 50,
      creditsMonthly: 50,
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive',
      totalGenerations: 0,
      totalImages: 0,
      totalVideos: 0,
    })
    console.log(`    ✓ Profile created with 50 free credits`)
  }
}

async function makeFirstUserAdmin() {
  console.log('\n=== Checking admin status ===\n')

  const profiles = await databases.listDocuments(DATABASE_ID, 'profiles', [
    Query.limit(100),
  ])

  const adminExists = profiles.documents.some((p: any) => p.role === 'admin')

  if (adminExists) {
    const admin = profiles.documents.find((p: any) => p.role === 'admin')
    console.log(`Admin already exists: ${admin?.email}`)
  } else if (profiles.documents.length > 0) {
    // Make the first user admin
    const first = profiles.documents[0]
    await databases.updateDocument(DATABASE_ID, 'profiles', first.$id, {
      role: 'admin',
    })
    console.log(`✓ Made ${first.email} an admin`)
  } else {
    console.log('No profiles yet — admin will be set after profile creation')
  }
}

async function main() {
  console.log('Tynkerlab DB Fix Script')
  console.log('=====================')
  console.log(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`)
  console.log(`Database: ${DATABASE_ID}`)

  await addMissingAttributes()
  await createMissingProfiles()
  await makeFirstUserAdmin()

  console.log('\n✓ Done!\n')
}

main().catch(console.error)
