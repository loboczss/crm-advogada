import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useProfileStore } from '../stores/profile'

export default defineNuxtRouteMiddleware(async () => {
  const profileStore = useProfileStore()

  if (!profileStore.profile) {
    await profileStore.fetchMe()
  }

  const role = profileStore.profile?.role
  if (role !== 'admin' && role !== 'vendedor') {
    return navigateTo('/')
  }
})
