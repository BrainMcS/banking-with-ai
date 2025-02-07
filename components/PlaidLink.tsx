import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation';
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions';
import Image from 'next/image';

type PaymentProcessor = 'dwolla' | 'stripe';

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [processor, setProcessor] = useState<PaymentProcessor>('dwolla'); // Set default value
  const [showProcessorSelect, setShowProcessorSelect] = useState(false);

  useEffect(() => {
    const getLinkToken = async () => {
      const data = await createLinkToken(user, processor);
      setToken(data?.linkToken);
    }
    getLinkToken();
  }, [user, processor]);

  // Add console.log to debug processor selection
  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
    try {
      console.log('Selected processor:', processor); // Add this line
      await exchangePublicToken({
        publicToken: public_token,
        user,
        processor,
      });
      router.push('/');
    } catch (error) {
      console.error('Error exchanging public token:', error);
    }
  }, [user, processor]);
  
  const config: PlaidLinkOptions = {
    token,
    onSuccess
  }

  const { open, ready } = usePlaidLink(config);

  const handleConnectClick = () => {
    setShowProcessorSelect(true);
  };

  const handleProcessorSelect = (selectedProcessor: PaymentProcessor) => {
    setProcessor(selectedProcessor);
    setShowProcessorSelect(false);
    open();
  };
  
  if (showProcessorSelect) {
    return (
      <div className="p-4 space-y-4 border rounded-lg shadow-sm bg-bank-gradient animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-3 animate-in slide-in-from-top duration-500">
            <Image 
              src="/icons/connect-bank.svg"
              alt="bank"
              width={24}
              height={24}
              className="brightness-0 invert opacity-100"
            />
            <h2 className="text-[16px] font-semibold text-white">Choose Payment Processor</h2>
          </div>
          
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom duration-500 delay-150">
            <Button
              onClick={() => handleProcessorSelect('dwolla')}
              variant="outline"
              className="flex items-center justify-center gap-2 hover:bg-orange-50 bg-white"
            >
              <Image 
                src="/icons/dwolla.svg"
                alt="Dwolla"
                width={128}
                height={128}
              />
              <span className="text-[16px] font-semibold text-black-2"/>
            </Button>
            <div className="cursor-not-allowed" title="Stripe is not available in France">
              <Button
                disabled
                variant="outline"
                className="w-full flex items-center justify-center gap-2 hover:bg-purple-50 bg-white opacity-50"
              >
                <Image 
                  src="/icons/stripe.svg"
                  alt="Stripe"
                  width={82}
                  height={82}
                />
                <span className="text-[16px] font-semibold text-black-2"/>
              </Button>
            </div>
            <div className="cursor-not-allowed" title="Coming soon">
              <Button
                disabled
                variant="outline"
                className="w-full flex items-center justify-center gap-2 hover:bg-blue-50 bg-white opacity-50"
              >
                <Image 
                  src="/icons/adyen.svg"
                  alt="Adyen"
                  width={96}
                  height={96}
                />
                <span className="text-[16px] font-semibold text-black-2"/>
              </Button>
            </div>
          </div>

          <Button
            onClick={() => setShowProcessorSelect(false)}
            role="button"
            variant="ghost"
            className="line-clamp-1 flex-1 text-[14px] font-medium w-fit mx-auto text-white hover:bg-gray-700/50 px-2 py-1 animate-in fade-in duration-700 delay-300"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {variant === 'primary' ? (
        <Button
          onClick={handleConnectClick}
          disabled={!ready}
          className="plaidlink-primary"
        >
          Connect bank
        </Button>
      ): variant === 'ghost' ? (
        <Button onClick={handleConnectClick} variant="ghost" className="flex gap-2">
          <Image 
            src="/icons/plus.svg"  // Changed to plus icon
            width={20}             // Match original dimensions
            height={20}
            alt="plus"
          />
          <h2 className="text-14 font-semibold text-gray-600">
            Add Bank
          </h2>
        </Button>
      ): (
        <Button onClick={handleConnectClick} className="plaidlink-default">
          <Image 
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className='text-[16px] font-semibold text-black-2'>Connect bank</p>
        </Button>
      )}
    </>
  );
}

export default PlaidLink