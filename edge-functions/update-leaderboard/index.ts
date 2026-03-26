import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function mondayStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as {
      userId?: string;
      languagePairId?: string;
      xpAmount?: number;
    };
    if (!body.userId || !body.languagePairId || body.xpAmount == null) {
      return new Response(JSON.stringify({ error: 'invalid body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const start = mondayStart();
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('xp_earned')
      .eq('user_id', body.userId)
      .eq('language_pair_id', body.languagePairId)
      .eq('period_type', 'weekly')
      .eq('period_start', start)
      .maybeSingle();
    const prev = (existing as { xp_earned: number } | null)?.xp_earned ?? 0;
    const next = prev + body.xpAmount;
    await supabase.from('leaderboard').upsert(
      {
        user_id: body.userId,
        language_pair_id: body.languagePairId,
        period_type: 'weekly',
        period_start: start,
        xp_earned: next,
      },
      { onConflict: 'user_id,language_pair_id,period_type,period_start' }
    );
    const { data: rows } = await supabase
      .from('leaderboard')
      .select('user_id, xp_earned')
      .eq('language_pair_id', body.languagePairId)
      .eq('period_type', 'weekly')
      .eq('period_start', start)
      .order('xp_earned', { ascending: false });
    const list = (rows as { user_id: string; xp_earned: number }[]) ?? [];
    let rank = 1;
    for (let i = 0; i < list.length; i++) {
      if (list[i]!.user_id === body.userId) {
        rank = i + 1;
        break;
      }
    }
    await supabase
      .from('leaderboard')
      .update({ rank })
      .eq('user_id', body.userId)
      .eq('language_pair_id', body.languagePairId)
      .eq('period_type', 'weekly')
      .eq('period_start', start);
    return new Response(JSON.stringify({ rank, xpEarned: next }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
