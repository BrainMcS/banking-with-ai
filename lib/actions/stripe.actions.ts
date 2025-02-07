"use server";

import Stripe from 'stripe';
import { plaidClient } from '@/lib/plaid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export const createStripeAccount = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  try {
    // Create a Stripe account for the user
    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'US',
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Link the bank account using Plaid processor token
    const bankAccount = await stripe.accounts.createExternalAccount(
      account.id,
      {
        external_account: accessToken, // This will be the Plaid processor token
      }
    );

    return bankAccount.id;
  } catch (error) {
    console.error('Stripe account setup failed:', error);
    throw error;
  }
};

export const createStripeBankAccount = async ({
  accessToken,
  accountId,
  bankName,
}: {
  accessToken: string;
  accountId: string;
  bankName: string;
}) => {
  try {
    // Create a processor token for Stripe
    const processorTokenResponse = await plaidClient.processorTokenCreate({
      access_token: accessToken,
      account_id: accountId,
      processor: 'stripe',
    });

    // Create a bank account using the processor token
    const bankAccount = await stripe.accounts.createExternalAccount(
      accountId,
      {
        external_account: processorTokenResponse.data.processor_token,
        default_for_currency: true,
      }
    );

    return bankAccount;
  } catch (error) {
    console.error('Failed to create Stripe bank account:', error);
    throw error;
  }
};

export const createStripeTransfer = async ({
  sourceAccountId,
  destinationAccountId,
  amount,
}: {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
}) => {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'usd',
      source_transaction: sourceAccountId,
      destination: destinationAccountId,
    });

    return transfer.id;
  } catch (error) {
    console.error('Stripe transfer failed:', error);
    throw error;
  }
};
