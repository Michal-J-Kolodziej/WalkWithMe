import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
  Bell,
  Calendar,
  Check,
  Footprints,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Save,
  Settings,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import { GlassCard } from '../../components/dashboard/DashboardWidgets'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'
import { Button } from '../../components/ui/Button'
import { ImageUpload } from '../../components/ui/ImageUpload'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { t, i18n } = useTranslation()
  const user = useQuery(api.users.current)
  const updateProfile = useMutation(api.users.updateProfile)
  const toggleLocationVisibility = useMutation(
    api.users.toggleLocationVisibility,
  )
  const updateBeaconPrivacy = useMutation(api.beacon.setBeaconPrivacy)

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [image, setImage] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [pendingStorageId, setPendingStorageId] =
    useState<Id<'_storage'> | null>(null)

  // We need to get the URL for uploaded images
  const uploadedImageUrl = useQuery(
    api.files.getUrl,
    pendingStorageId ? { storageId: pendingStorageId } : 'skip',
  )

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setLocation(user.location || '')
      setImage(user.image || '')
      setAge(user.age || '')
    }
  }, [user])

  // Track changes
  useEffect(() => {
    if (user) {
      const changed =
        name !== (user.name || '') ||
        bio !== (user.bio || '') ||
        location !== (user.location || '') ||
        image !== (user.image || '') ||
        age !== (user.age || '') ||
        pendingStorageId !== null
      setHasChanges(changed)
    }
  }, [name, bio, location, image, age, user, pendingStorageId])

  // Loading state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (user === null) {
    return null
  }

  const handleReset = () => {
    setName(user.name || '')
    setBio(user.bio || '')
    setLocation(user.location || '')
    setImage(user.image || '')
    setAge(user.age || '')
    setPendingStorageId(null)
    setError(null)
    setSuccess(false)
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)
    setIsSaving(true)

    try {
      // If we have an uploaded image, use that URL instead
      const imageToSave =
        pendingStorageId && uploadedImageUrl
          ? uploadedImageUrl
          : image.trim() || undefined

      await updateProfile({
        name: name.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        image: imageToSave,
        age: age !== '' ? age : undefined,
      })

      // Clear pending upload and update local state
      if (pendingStorageId && uploadedImageUrl) {
        setImage(uploadedImageUrl)
        setPendingStorageId(null)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            {t('settings.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
            <Check className="w-5 h-5" />
            <span>{t('settings.changesSaved')}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Settings */}
        <GlassCard hover={false}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">
                  {t('settings.profileSettings')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('settings.profileSettingsDesc')}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t('settings.displayName')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('settings.displayNamePlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                  transition-all"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                {t('settings.bio')}
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('settings.bioPlaceholder')}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                  transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/500
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-sm font-medium flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {t('settings.location')}
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('settings.locationPlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                  transition-all"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label
                htmlFor="age"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {t('settings.age')}
              </label>
              <input
                id="age"
                type="number"
                min="13"
                max="120"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value ? parseInt(e.target.value, 10) : '')
                }
                placeholder={t('settings.agePlaceholder')}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                  transition-all"
              />
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('settings.profileImage')}
              </label>
              <div className="flex items-start gap-6">
                <ImageUpload
                  currentImageUrl={
                    pendingStorageId && uploadedImageUrl
                      ? uploadedImageUrl
                      : image
                  }
                  onUpload={(storageId) => setPendingStorageId(storageId)}
                  onRemove={() => {
                    setPendingStorageId(null)
                    setImage('')
                  }}
                  shape="circle"
                  disabled={isSaving}
                />
                {(image || pendingStorageId) && (
                  <span className="text-sm text-muted-foreground mt-8">
                    {t('settings.preview')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Account Info */}
        <GlassCard hover={false}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="font-semibold">{t('settings.accountInfo')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('settings.accountInfoDesc')}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t('settings.email')}
                </p>
                <p className="font-medium">
                  {user.email || t('settings.notSet')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t('settings.role')}
                </p>
                <p className="font-medium capitalize">
                  {user.role || t('profile.dogOwner')}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Preferences */}
        <GlassCard hover={false}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Bell className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="font-semibold">{t('settings.preferences')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('settings.preferencesDesc')}
                </p>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {t('settings.emailNotifications')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.emailNotificationsDesc')}
                  </p>
                </div>
              </div>
              <button
                className="relative w-12 h-6 rounded-full bg-primary/20 transition-colors cursor-pointer"
                disabled
              >
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-muted-foreground transition-transform" />
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t('settings.language')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.languageDesc')}
                  </p>
                </div>
              </div>
              <select
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                  transition-all"
              >
                <option value="en">{t('settings.english')}</option>
                <option value="pl">{t('settings.polish')}</option>
              </select>
            </div>

            <p className="text-xs text-muted-foreground italic">
              {t('settings.preferencesNote')}
            </p>
          </div>
        </GlassCard>

        {/* Location Services */}
        <GlassCard hover={false}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-green-500/10">
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="font-semibold">
                  {t('settings.locationServices')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('settings.locationServicesDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t('settings.shareLocation')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.shareLocationDesc')}
                  </p>
                </div>
              </div>
              <button
                className={`
                  relative w-12 h-6 rounded-full transition-colors cursor-pointer
                  ${user.isLocationEnabled ? 'bg-primary' : 'bg-muted'}
                `}
                onClick={() =>
                  toggleLocationVisibility({ enabled: !user.isLocationEnabled })
                }
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-all
                    ${user.isLocationEnabled ? 'left-7' : 'left-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Beacon Settings */}
        <GlassCard hover={false}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Footprints className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="font-semibold">
                  {t('settings.beaconSettings')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('settings.beaconSettingsDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.whoCanSeeBeacon')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.whoCanSeeBeaconDesc')}
                  </p>
                </div>
                <select
                  value={user.beacon?.privacy || 'friends'}
                  onChange={(e) =>
                    updateBeaconPrivacy({ privacy: e.target.value })
                  }
                  className="px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                    transition-all"
                >
                  <option value="friends">
                    {t('settings.privacyFriends')}
                  </option>
                  <option value="public">{t('settings.privacyPublic')}</option>
                  <option value="none">{t('settings.privacyNone')}</option>
                </select>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className="gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-2 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('settings.saveChanges')}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
