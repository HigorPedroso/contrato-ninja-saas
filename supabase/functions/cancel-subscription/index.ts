import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stripe_subscription_id) {
      throw new Error('No subscription found')
    }

    // Get current subscription
    console.log('Buscando assinatura:', profile.stripe_subscription_id);
    const currentSubscription = await stripe.subscriptions.retrieve(
      profile.stripe_subscription_id
    );
    console.log('Assinatura atual:', currentSubscription);

    if (!currentSubscription) {
      throw new Error('Subscription not found in Stripe')
    }

    // Cancel subscription at period end instead of immediately
    console.log('Tentando cancelar assinatura Stripe:', profile.stripe_subscription_id);
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      {
        cancel_at_period_end: true
      }
    );
    console.log('Resultado do cancelamento:', subscription);

    if (!subscription) {
      throw new Error('Failed to cancel subscription')
    }

    // Update profile status but keep subscription data until period end
    await supabaseClient
      .from('profiles')
      .update({ 
        subscription_status: 'canceling',
        subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('id', user.id)

    return new Response(
      JSON.stringify({ 
        message: 'Subscription cancelled',
        status: 'success'
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while canceling the subscription',
        status: 'error'
      }), 
      {
        status: 200, // Changed to 200 to avoid CORS issues
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})