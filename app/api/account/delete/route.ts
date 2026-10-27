import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = adminClient();
  const token = authHeader.substring(7);
  const { data: userData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;

  const { error: scrubError } = await supabase.auth.admin.updateUserById(userId, {
    email: `deleted-${userId}@deleted.invalid`,
    password: crypto.randomUUID(),
    user_metadata: {},
  });

  if (scrubError) {
    console.error('Account scrub failed:', scrubError);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId, true);

  if (deleteError) {
    console.error('Account soft delete failed:', deleteError);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
