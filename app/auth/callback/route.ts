import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
        );
      }
    } catch (err) {
      console.error('Auth callback error:', err);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=Authentication failed`
      );
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
