import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.15.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Update user's premium status
          await supabase
            .from('users')
            .update({
              premium_until: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', userId)

          // Create subscription record
          await supabase
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )

          // Update subscription record
          await supabase
            .from('user_subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

          // Update user's premium status
          const { data: userSub } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (userSub) {
            await supabase
              .from('users')
              .update({
                premium_until: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq('id', userSub.user_id)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Update subscription status
        await supabase
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        // Remove premium status
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userSub) {
          await supabase
            .from('users')
            .update({ premium_until: null })
            .eq('id', userSub.user_id)
        }
        break
      }
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
})