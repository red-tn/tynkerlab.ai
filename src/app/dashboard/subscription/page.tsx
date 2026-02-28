'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { TIERS } from '@/lib/stripe/products'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Coins, CreditCard, ExternalLink, Zap } from 'lucide-react'

export default function SubscriptionPage() {
  const { user, profile } = useAuth()
  const { balance } = useCredits(user?.$id)
  const [loading, setLoading] = useState(false)

  const currentTier = TIERS.find(t => t.id === (profile?.subscriptionTier || 'free')) || TIERS[0]

  const handleManageBilling = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.$id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Portal error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your plan and credits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-400" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{currentTier.name}</span>
              <Badge variant={profile?.subscriptionStatus === 'active' ? 'success' : 'default'}>
                {profile?.subscriptionStatus || 'free'}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">{currentTier.description}</p>
            <ul className="space-y-1.5">
              {currentTier.features.slice(0, 4).map(f => (
                <li key={f} className="text-sm text-gray-300 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary-400" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 pt-2">
              {currentTier.id !== 'free' && (
                <Button variant="secondary" onClick={handleManageBilling} loading={loading} size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
              )}
              <Button variant="ghost" onClick={() => window.location.href = '/pricing'} size="sm">
                {currentTier.id === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credit Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary-400" />
              Credit Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-4xl font-bold text-white font-mono">{balance.toLocaleString()}</span>
              <span className="text-gray-500 text-sm ml-2">credits available</span>
            </div>
            <Progress
              value={Math.min(balance, currentTier.credits || 1000)}
              max={currentTier.credits || 1000}
              size="md"
            />
            <p className="text-xs text-gray-500">
              {currentTier.credits > 0
                ? `${currentTier.credits.toLocaleString()} credits included with your ${currentTier.name} plan`
                : 'Purchase credits or upgrade your plan'}
            </p>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/pricing#packs'}
              size="sm"
              className="w-full"
            >
              <Coins className="h-4 w-4 mr-2" />
              Buy More Credits
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
