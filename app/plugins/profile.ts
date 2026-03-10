export default defineNuxtPlugin(async () => {
    const user = useSupabaseUser()
    const profileStore = useProfileStore()

    // Fetch profile if user exists (works on both SSR and Client)
    if (user.value) {
        await profileStore.fetchMe()
    }

    // Auth state changes only matter on the client
    if (import.meta.client) {
        const supabase = useSupabaseClient()
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                profileStore.fetchMe()
            } else if (event === 'SIGNED_OUT') {
                profileStore.clearProfile()
            }
        })
    }
})
