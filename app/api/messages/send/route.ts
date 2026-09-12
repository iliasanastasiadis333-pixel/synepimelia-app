import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyzeTone, type ToneAnalysisResult } from '@/lib/tone-analyzer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Type definitions
interface MessageInsertPayload {
  case_id: string;
  content: string;
  force_send?: boolean; // Allow sending despite negative tone (ALWAYS re-analyze server-side)
}

interface MessageRecord {
  id: string;
  case_id: string;
  sender_id: string;
  content: string;
  flag_tone: string | null;
  read_at: string | null;
  created_at: string;
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    // 1. Get and verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // 2. Parse and validate request body
    const body: MessageInsertPayload = await request.json();
    const { case_id, content, force_send = false } = body;

    if (!case_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: case_id, content' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content must be a non-empty string' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Message content exceeds 5000 character limit' },
        { status: 400 }
      );
    }

    // 3. Verify sender is part of the case (using RLS-aware query)
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

    const senderId = profileData.id;

    // Verify sender is participant in the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', case_id)
      .or(
        `parent1_id.eq.${senderId},parent2_id.eq.${senderId},lawyer_id.eq.${senderId},mediator_id.eq.${senderId}`
      )
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'You are not authorized to send messages to this case' },
        { status: 403 }
      );
    }

    // 4. Analyze tone with Claude API
    // ALWAYS perform server-side analysis - NEVER trust client-provided tone data
    // This prevents users from spoofing analysis results
    let toneAnalysis: ToneAnalysisResult;
    try {
      toneAnalysis = await analyzeTone(content);
    } catch (error) {
      console.error('Tone analysis error:', error);
      return NextResponse.json(
        { error: 'Failed to analyze message tone' },
        { status: 500 }
      );
    }

    // 5. Check if tone is acceptable or force_send is enabled
    const isNegativeTone = toneAnalysis.tone === 'negative' || toneAnalysis.tone === 'concerning';

    if (isNegativeTone && !force_send) {
      // Reject message and suggest alternative
      return NextResponse.json(
        {
          error: 'Message tone not suitable for storage',
          tone: toneAnalysis.tone,
          score: toneAnalysis.score,
          flags: toneAnalysis.flags,
          suggested_alternative: toneAnalysis.suggested_alternative,
          can_force_send: true, // Inform client they can retry with force_send=true
        },
        { status: 422 }
      );
    }

    // 6. Store message in database
    // Note: If force_send=true and tone is negative/concerning, flag_tone will be "negative" or "concerning"
    // This creates an official record of the tone for court proceedings
    const { data: storedMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        case_id,
        sender_id: senderId,
        content: content.trim(),
        flag_tone: toneAnalysis.tone, // Will be 'negative' or 'concerning' if force_send=true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to store message' },
        { status: 500 }
      );
    }

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        message: storedMessage as MessageRecord,
        tone_analysis: {
          tone: toneAnalysis.tone,
          score: toneAnalysis.score,
          flags: toneAnalysis.flags,
        },
        // Notify if message was sent with force_send override
        force_sent: force_send && isNegativeTone,
        warning: force_send && isNegativeTone
          ? `Το μήνυμα αποθηκεύτηκε με flag "${toneAnalysis.tone}" - θα εμφανιστεί στο επίσημο ιστορικό.`
          : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
