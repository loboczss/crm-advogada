export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  const publicRoutes = ['/recovery', '/confirm', '/auth/dropbox']
  if (!user.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
})
