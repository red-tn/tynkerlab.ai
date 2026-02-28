import { Client, Databases, Storage, Users, Account } from 'node-appwrite'

export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)

  return {
    client,
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
    account: new Account(client),
  }
}

export function createSessionClient(session: string) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setSession(session)

  return {
    client,
    databases: new Databases(client),
    storage: new Storage(client),
    account: new Account(client),
  }
}

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!

export const COLLECTIONS = {
  PROFILES: 'profiles',
  GENERATIONS: 'generations',
  CREDIT_TRANSACTIONS: 'credit_transactions',
  SUBSCRIPTIONS: 'subscriptions',
  CREDIT_PACK_PURCHASES: 'credit_pack_purchases',
  PROMPTS: 'prompts',
  PAGE_VIEWS: 'page_views',
  API_USAGE_LOG: 'api_usage_log',
  ADMIN_ACTIVITY_LOG: 'admin_activity_log',
  SITE_SETTINGS: 'site_settings',
  AFFILIATES: 'affiliates',
  AFFILIATE_EVENTS: 'affiliate_events',
} as const
