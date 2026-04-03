import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const isProd = process.env.NODE_ENV === 'production';
                        response.cookies.set(name, value, { ...options, secure: isProd, domain: undefined })
                    })
                },
            },
        }
    )

    // IMPORTANT: Do not remove this line. It refreshes the session if expired.
    console.log(`[Middleware] Target path: ${request.nextUrl.pathname}`);
    console.log(`[Middleware] Incoming cookies: ${request.cookies.getAll().map((c: any) => c.name).join(', ')}`);
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log(`[Middleware] User authenticated: ${!!user}${error ? ' Error: ' + error.message : ''}`);

    const pathname = request.nextUrl.pathname
    const isPublicRoute = pathname === '/' || pathname === '/login' || pathname.startsWith('/auth/')

    // 1. Redirect unauthenticated users
    if (!user && !isPublicRoute) {
        const url = new URL('/login', request.url)
        return NextResponse.redirect(url)
    }

    // 2. Auth Flow for logged in users
    if (user) {
        let role = 'student';
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            if (profile) role = profile.role;
        } catch (e) {
            console.error("[Middleware] Profile fetch failed:", e);
        }

        // Redirect away from login if authenticated
        if (pathname === '/login') {
            const dashboard = role === 'admin' ? '/admin' : (role === 'department_officer' ? '/department' : '/my-complaints')
            return NextResponse.redirect(new URL(dashboard, request.url))
        }

        // RBAC checks
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/my-complaints', request.url))
        }

        if (pathname.startsWith('/department') && role !== 'department_officer' && role !== 'admin') {
            return NextResponse.redirect(new URL('/my-complaints', request.url))
        }
    }

    return response
}
