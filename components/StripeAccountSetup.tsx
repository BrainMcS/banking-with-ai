'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const StripeAccountSetup = ({ user }: { user: User }) => {
  const [stripe, setStripe] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);
    })();
  }, []);

  const createStripeTokens = async () => {
    if (!stripe) return;

    const accountResult = await stripe.createToken('account', {
      business_type: 'individual',
      individual: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      },
      tos_shown_and_accepted: true,
    });

    if (accountResult.token) {
      return accountResult.token.id;
    }
    throw new Error('Failed to create Stripe account token');
  };

  return null; // This component doesn't render anything
};