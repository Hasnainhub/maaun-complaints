import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const cookie = request.cookies.get('maaun-mock-auth')

    // Basic route protection
    if (request.nextUrl.pathname.startsWith('/admin') || 
        request.nextUrl.pathname.startsWith('/my-complaints') || 
        request.nextUrl.pathname.startsWith('/track')) {
        
        if (!cookie) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next({
        request,
    })
}
