'use client'

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import MarketMovers from '@/components/MarketMovers';
import HeaderBox from '@/components/HeaderBox';
import FinancialAdvisor from '@/components/FinancialAdvisor';
import Link from 'next/link';
import type { Session } from 'next-auth';
import type { AIModel } from '@/lib/ai/models';

interface MarketPageClientProps {
  session: Session | null;
  id: string;
  selectedModelId: string;
  availableModels: AIModel[];
}

export default function MarketPageClient({ 
  session, 
  id, 
  selectedModelId, 
  availableModels 
}: MarketPageClientProps) {
  if (!session?.user) {
    return (
      <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
        {/* ... auth UI code ... */}
      </div>
    );
  }

  return (
    <div className="markets dark:bg-dark-background min-h-screen w-full pb-20">
      <div className="market-header">
        <HeaderBox 
          title="Market overview"
          subtext="See the market activity."
          darkMode={true}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <section className="lg:col-span-2 market-tables">
          <MarketMovers />
        </section>
        <FinancialAdvisor />
      </div>
      <Chat
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
        availableModels={availableModels}
        selectedVisibilityType="public"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </div>
  );
}