import { useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import ProfileSettings from '../../components/settings/ProfileSettings'
import GoalSettings from '../../components/settings/GoalSettings'
import AvailabilitySettings from '../../components/settings/AvailabilitySettings'
import NotificationSettings from '../../components/settings/NotificationSettings'
import AppearanceSettings from '../../components/settings/AppearanceSettings'
import AccountSettings from '../../components/settings/AccountSettings'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { useToast } from '../../context/ToastContext'
import { errorMessage } from '../../services/api'

export default function SettingsPage() {
  const { user, updateProfile, preferences, updatePreferences } = useAuth()
  const { goal, plan, updateGoal, runAdaptation, adapting } = usePlan()
  const toast = useToast()
  const [planStale, setPlanStale] = useState(false)

  async function saveProfile(patch) {
    await updateProfile(patch)
    toast.success('Profile updated.')
  }

  async function saveGoal(patch, message) {
    await updateGoal(patch)
    setPlanStale(true)
    toast.success(message)
  }

  async function savePreferences(patch, message) {
    try {
      await updatePreferences(patch)
      toast.success(message)
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your preferences.'))
    }
  }

  async function rebalance() {
    try {
      const result = await runAdaptation({ userRequested: 'REPLAN' })
      setPlanStale(false)
      toast.success(`New plan version v${result.newVersion} created from your updated settings.`)
    } catch (error) {
      toast.error(errorMessage(error, 'Could not replan. Please try again.'))
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-semibold text-ink">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, goal, and app preferences.</p>
      </div>

      <div className="space-y-4">
        {planStale && (
          <Card className="border-runway-100 bg-runway-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-700">
                Your goal or availability changed. Plan v{plan.version} still uses the old settings.
              </p>
              <Button size="sm" icon={RefreshCcw} onClick={rebalance} loading={adapting}>
                Replan with new settings
              </Button>
            </div>
          </Card>
        )}

        <ProfileSettings user={user} onSave={saveProfile} />
        {goal && (
          <>
            <GoalSettings goal={goal} onSave={(patch) => saveGoal(patch, 'Goal updated.')} />
            <AvailabilitySettings goal={goal} onSave={(patch) => saveGoal(patch, 'Availability updated.')} />
          </>
        )}
        <NotificationSettings
          notifications={preferences.notifications}
          onChange={(notifications) => savePreferences({ notifications }, 'Notification preferences saved.')}
        />
        <AppearanceSettings theme={preferences.theme} onChange={(theme) => savePreferences({ theme }, `Theme set to ${theme}.`)} />
        <AccountSettings />
      </div>
    </div>
  )
}
