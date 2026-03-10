export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  const publicRoutes = ['/recovery']
  if (!user.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }
})
