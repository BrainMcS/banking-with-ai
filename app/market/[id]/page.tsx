import MarketMovers from '@/components/MarketMovers'
import HeaderBox from '@/components/HeaderBox'
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';  // Updated auth import
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { getOpenAIApiKey, getGeminiApiKey, getClaudeApiKey } from '@/lib/db/api-keys';

export default async function MarketChatPage({ params }: { params: { id: string } }) {
  const id = await Promise.resolve(params.id);  // Fix the params warning
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  
  // Get API keys
  const [openAIKey, geminiKey, claudeKey] = await Promise.all([
    getOpenAIApiKey(),
    getGeminiApiKey(),
    getClaudeApiKey()
  ]);

  // Get available models based on API keys
  const availableModels = models.filter(model => {
    switch (model.provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY || !!openAIKey;
      case 'gemini':
        return !!process.env.GOOGLE_API_KEY || !!geminiKey;
      case 'claude':
        return !!process.env.ANTHROPIC_API_KEY || !!claudeKey;
      default:
        return false;
    }
  });

  // Select model ID, prioritizing the cookie value if it's available
  const selectedModelId = modelIdFromCookie && 
    availableModels.some(model => model.id === modelIdFromCookie) ? 
    modelIdFromCookie : 
    (availableModels[0]?.id || DEFAULT_MODEL_NAME);

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen">
        <div className="markets dark:bg-dark-background pb-20">
          <div className="market-header">
            <HeaderBox 
              title="Market overview"
              subtext="See the market activity."
              darkMode={true}
            />
          </div>
          <div className="flex relative">
            <div className="flex-1 mr-[900px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                <section className="lg:col-span-2 market-tables">
                  <MarketMovers />
                </section>
              </div>
            </div>

            {/* Chat section */}
            <div className="w-[600px] h-full fixed right-0 top-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto z-50">
              <div className="flex-1 overflow-y-auto mb-24">
                <Chat
                  id={chat.id}
                  initialMessages={convertToUIMessages(messagesFromDb)}
                  selectedModelId={selectedModelId}
                  availableModels={availableModels}
                  selectedVisibilityType={chat.visibility}
                  isReadonly={session?.user?.id !== chat.userId}
                  routePrefix="/market"
                  apiEndpoint="/api/market"  // Add this line
                />
              </div>
              <div className="sticky bottom-0 left-0 right-0 z-[9999] bg-background shadow-lg">
                <DataStreamHandler id={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}