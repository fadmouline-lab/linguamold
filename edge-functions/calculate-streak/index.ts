import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { userId } = (await req.json()) as { userId?: string };
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const today = new Date().toISOString().slice(0, 10);
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toISOString().slice(0, 10);
    const { data: tRow } = await supabase
      .from('user_streaks')
      .select('id')
      .eq('user_id', userId)
      .eq('streak_date', today)
      .maybeSingle();
    const { data: yRow } = await supabase
      .from('user_streaks')
      .select('id')
      .eq('user_id', userId)
      .eq('streak_date', yesterday)
      .maybeSingle();
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('current_streak, longest_streak')
      .eq('id', userId)
      .maybeSingle();
    let current = (prof as { current_streak: number } | null)?.current_streak ?? 0;
    const longest =
      (prof as { longest_streak: number } | null)?.longest_streak ?? 0;
    let broken = false;
    if (tRow) {
      /* keep */
    } else if (yRow) {
      current = current;
    } else if (current > 0) {
      current = 0;
      broken = true;
    }
    await supabase
      .from('user_profiles')
      .update({
        current_streak: current,
        longest_streak: Math.max(longest, current),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    return new Response(
      JSON.stringify({
        currentStreak: current,
        longestStreak: Math.max(longest, current),
        streakBroken: broken,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
