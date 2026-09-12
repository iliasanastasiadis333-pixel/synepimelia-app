import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// REQUEST TYPES
// ============================================

interface CreateSwapRequestPayload {
  custody_schedule_id: string;
  requested_date: string; // ISO date (YYYY-MM-DD)
  offered_swap_date: string; // ISO date (YYYY-MM-DD)
  reason?: string;
}

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

// ============================================
// POST /api/calendar/swap-request - CREATE
// ============================================

export async function POST(request: NextRequest) {
  try {
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

    const requesterId = profileData.id;

    // 3. Parse request body
    const body: CreateSwapRequestPayload = await request.json();
    const { custody_schedule_id, requested_date, offered_swap_date, reason } = body;

    if (!custody_schedule_id || !requested_date || !offered_swap_date) {
      return NextResponse.json(
        { error: 'Missing required fields: custody_schedule_id, requested_date, offered_swap_date' },
        { status: 400 }
      );
    }

    // Validate dates
    const reqDate = new Date(requested_date);
    const offDate = new Date(offered_swap_date);

    if (isNaN(reqDate.getTime()) || isNaN(offDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (requested_date === offered_swap_date) {
      return NextResponse.json(
        { error: 'Requested date and offered swap date cannot be the same' },
        { status: 400 }
      );
    }

    // 4. Verify user is a parent in the case
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('custody_schedules')
      .select('case_id')
      .eq('id', custody_schedule_id)
      .single();

    if (scheduleError || !scheduleData) {
      return NextResponse.json(
        { error: 'Custody schedule not found' },
        { status: 404 }
      );
    }

    const caseId = scheduleData.case_id;

    // Verify requester is a parent in the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('parent1_id, parent2_id')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (
      caseData.parent1_id !== requesterId &&
      caseData.parent2_id !== requesterId
    ) {
      return NextResponse.json(
        { error: 'You are not a parent in this case' },
        { status: 403 }
      );
    }

    // 5. Create swap request
    const { data: swapRequest, error: insertError } = await supabase
      .from('swap_requests')
      .insert({
        case_id: caseId,
        custody_schedule_id,
        requester_id: requesterId,
        requested_date,
        offered_swap_date,
        reason: reason?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create swap request' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json(
      {
        success: true,
        swap_request: swapRequest as SwapRequestRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

