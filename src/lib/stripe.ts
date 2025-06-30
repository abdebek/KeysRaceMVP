import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe failed to load');

  const { error } = await stripe.redirectToCheckout({
    sessionId
  });

  if (error) throw error;
}

export async function createPaymentIntent(amount: number, currency = 'usd') {
  // This would call your backend API
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, currency }),
  });

  return response.json();
}

// Premium plan configurations
export const PREMIUM_PLANS = {
  monthly: {
    priceId: 'price_monthly_premium',
    amount: 499, // $4.99
    interval: 'month'
  },
  yearly: {
    priceId: 'price_yearly_premium',
    amount: 3999, // $39.99
    interval: 'year'
  }
};