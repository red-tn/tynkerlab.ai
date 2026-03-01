'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Query } from 'appwrite'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { Camera, Wand2, Trash2, LogOut, Upload, MapPin, Globe, Coins, Calendar, Crown, ImageIcon, KeyRound } from 'lucide-react'
import { useCredits } from '@/hooks/use-credits'
import Link from 'next/link'
import { storage, BUCKET_AVATARS } from '@/lib/appwrite/client'
import { ID } from 'appwrite'

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { addToast } = useToast()
  const { balance } = useCredits(user?.$id)
  const [fullName, setFullName] = useState(profile?.fullName || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [website, setWebsite] = useState(profile?.website || '')
  const [avatarPrompt, setAvatarPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [generatingAvatar, setGeneratingAvatar] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const isOAuthUser = user?.passwordUpdate === ''

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profile.$id, {
        fullName,
        bio: bio || null,
        location: location || null,
        website: website || null,
      })
      await account.updateName(fullName)
      await refreshProfile()
      addToast('Profile updated successfully', 'success')
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateAvatar = async () => {
    if (!avatarPrompt.trim()) {
      addToast('Please enter a prompt for your avatar', 'warning')
      return
    }
    setGeneratingAvatar(true)
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: avatarPrompt }),
      })
      if (!res.ok) throw new Error('Failed to generate avatar')
      const data = await res.json()
      await refreshProfile()
      addToast('Avatar generated!', 'success')
    } catch (err: any) {
      addToast(err.message || 'Failed to generate avatar', 'error')
    } finally {
      setGeneratingAvatar(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingPhoto(true)
    try {
      const uploaded = await storage.createFile(BUCKET_AVATARS, ID.unique(), file)
      const fileUrl = storage.getFileView(BUCKET_AVATARS, uploaded.$id).toString()
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profile.$id, {
        avatarUrl: fileUrl,
      })
      await refreshProfile()
      addToast('Profile photo updated!', 'success')
    } catch (err: any) {
      addToast(err.message || 'Failed to upload photo', 'error')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    try {
      await fetch('/api/profile', { method: 'DELETE' })
      await signOut()
    } catch (err: any) {
      addToast(err.message || 'Failed to delete account', 'error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar src={profile?.avatarUrl} fallback={profile?.fullName || '?'} size="xl" />
            <div className="space-y-3 flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your AI avatar..."
                  value={avatarPrompt}
                  onChange={(e) => setAvatarPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleGenerateAvatar}
                  loading={generatingAvatar}
                  disabled={!avatarPrompt.trim()}
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-nyx-border text-xs text-gray-300 hover:bg-white/10 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Generate an AI avatar or upload a custom photo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={500}
                className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 text-right">{bio.length}/500</p>
            </div>
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value.slice(0, 100))}
              placeholder="City, Country"
            />
            <Input
              label="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value.slice(0, 200))}
              placeholder="https://yoursite.com"
            />
            <Button onClick={handleSaveProfile} loading={saving}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            {isOAuthUser ? 'Set Password' : 'Change Password'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isOAuthUser && (
            <p className="text-xs text-gray-400 mb-4 p-2 rounded-lg bg-primary-500/5 border border-primary-500/10">
              You signed in with Google/GitHub. Set a password to also sign in with email.
            </p>
          )}
          <div className="space-y-3">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />
            <Button
              disabled={!newPassword || newPassword.length < 8 || newPassword !== confirmPassword}
              loading={savingPassword}
              onClick={async () => {
                setSavingPassword(true)
                try {
                  await account.updatePassword(newPassword)
                  setNewPassword('')
                  setConfirmPassword('')
                  addToast('Password updated successfully', 'success')
                } catch (err: any) {
                  addToast(err.message || 'Failed to update password', 'error')
                } finally {
                  setSavingPassword(false)
                }
              }}
            >
              {isOAuthUser ? 'Set Password' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nyx-bg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm text-white">
                  {profile?.$createdAt
                    ? new Date(profile.$createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nyx-bg">
              <Crown className="h-5 w-5 text-primary-400" />
              <div>
                <p className="text-xs text-gray-500">Tier</p>
                <p className="text-sm text-white">{profile?.subscriptionTier === 'enterprise' ? 'Pro Creator' : profile?.subscriptionTier === 'pro' ? 'Creator' : 'Free'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nyx-bg">
              <ImageIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Generations</p>
                <p className="text-sm text-white">{(profile?.totalGenerations || 0).toLocaleString()}</p>
              </div>
            </div>
            <Link href="/dashboard/credits" className="flex items-center gap-3 p-3 rounded-lg bg-nyx-bg hover:bg-white/5 transition-colors">
              <Coins className="h-5 w-5 text-primary-400" />
              <div>
                <p className="text-xs text-gray-500">Credits</p>
                <p className="text-sm text-white font-mono">{balance.toLocaleString()}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error/20">
        <CardHeader>
          <CardTitle className="text-error">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={signOut} className="w-full">
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>
    </div>
  )
}
