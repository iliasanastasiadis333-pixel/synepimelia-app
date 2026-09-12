import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RespondToSwapRequestPayload {
  status: 'approved' | 'declined';
  response_notes?: string;
}

interface SwapRequestRecord {
  id: string;
  case_id: string;
  custody_schedule_id: string;
  requester_id: string;
  requested_date: string;
  offered_swap_date: string;
  reason: string | null;
  status: string;
  response_notes: string | null;
  responded_by_id: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const { id } = await params;
    const swapRequestId = id;

    // 1. Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userData.user.id;

    // 2. Get user's profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const responderId = profileData.id;

    // 3. Parse request body
    const body: RespondToSwapRequestPayload = await request.json();
    const { status, response_notes } = body;

    if (!status || !['approved', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "approved" or "declined"' },
        { status: 400 }
      );
    }

    // 4. Fetch swap request
    const { data: swapRequest, error: fetchError } = await supabase
      .from('swap_requests')
      .select('id, case_id, requester_id, status')
      .eq('id', swapRequestId)
      .single();

    if (fetchError || !swapRequest) {
      return NextResponse.json(
        { error: 'Swap request not found' },
        { status: 404 }
      );
    }

    // 5. Verify swap request is pending
    if (swapRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Swap request is already ${swapRequest.status}` },
        { status: 400 }
      );
    }

    // 6. Verify responder is the OTHER parent
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('parent1_id, parent2_id')
      .eq('id', swapRequest.case_id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const isOtherParent =
      (caseData.parent1_id === responderId && caseData.parent2_id === swapRequest.requester_id) ||
      (caseData.parent2_id === responderId && caseData.parent1_id === swapRequest.requester_id);

    if (!isOtherParent) {
      return NextResponse.json(
        { error: 'Only the other parent can respond to this swap request' },
        { status: 403 }
      );
    }

    // 7. Update swap request with response
    const { data: updatedRequest, error: updateError } = await supabase
      .from('swap_requests')
      .update({
        status,
        response_notes: response_notes?.trim() || null,
        responded_by_id: responderId,
        responded_at: new Date().toISOString(),
      })
      .eq('id', swapRequestId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update swap request' },
        { status: 500 }
      );
    }

    // 8. Return success
    return NextResponse.json(
      {
        success: true,
        swap_request: updatedRequest as SwapRequestRecord,
        message: `Swap request ${status}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
