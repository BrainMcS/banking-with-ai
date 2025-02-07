import { ProcessorTokenCreateRequestProcessorEnum } from 'plaid';
import * as dwollaActions from './dwolla.actions';
import * as stripeActions from './stripe.actions';
import { plaidClient } from '@/lib/plaid';

export type PaymentProcessor = 'dwolla' | 'stripe';

export const handlePaymentProcessing = async ({
  processor,
  accessToken,
  accountId,
  userId,
  bankName,
}: {
  processor: PaymentProcessor;
  accessToken: string;
  accountId: string;
  userId: string;
  bankName: string;
}) => {
  try {
    const processorEnum = processor === 'dwolla' 
      ? 'dwolla' as ProcessorTokenCreateRequestProcessorEnum
      : 'stripe' as ProcessorTokenCreateRequestProcessorEnum;

    // Create processor token
    const processorResponse = await plaidClient.processorTokenCreate({
      access_token: accessToken,
      account_id: accountId,
      processor: processorEnum,
    });

    const processorToken = processorResponse.data.processor_token;

    // Handle processor-specific logic
    if (processor === 'dwolla') {
      return await dwollaActions.addFundingSource({
        dwollaCustomerId: userId,
        processorToken,
        bankName,
      });
    } else {
      // Create Stripe account and update user
      const stripeAccountId = await stripeActions.createStripeAccount({
        accessToken: processorToken,
        accountId,
        userId,
        bankName,
      });

      // Update user with Stripe account ID if not already set
      if (stripeAccountId) {
        await updateUserStripeAccount(userId, stripeAccountId);
      }

      return stripeAccountId;
    }
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw error;
  }
};