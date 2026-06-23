export function createClient() {
    return {
        from: () => { throw new Error('Client-side Supabase client is disabled in local JSON mock. Use server actions.'); },
        auth: {
            getUser: async () => ({ data: { user: null }, error: null })
        }
    }
}
