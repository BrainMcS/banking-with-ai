import MarketMovers from '@/components/MarketMovers'
import HeaderBox from '@/components/HeaderBox'
import { AppSidebar } from '@/components/app-sidebar';
import { SessionProvider } from 'next-auth/react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/providers';
import { Chat } from '@/components/chat'
import { Toaster } from 'sonner';
import { AuthCheck } from '@/app/components/AuthCheck';
import { Analytics } from "@vercel/analytics/react"
import { DataStreamHandler } from '@/components/data-stream-handler'
import Link from 'next/link'
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { generateUUID } from '@/lib/utils'
import { getOpenAIApiKey, getGeminiApiKey, getClaudeApiKey } from '@/lib/db/api-keys'
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models'
import { getLoggedInUser } from '@/lib/actions/user.actions';

export default async function Market({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const id = generateUUID();
  const session = await auth();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  const loggedIn = await getLoggedInUser();

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

  const selectedModelId = modelIdFromCookie && 
    availableModels.some(model => model.id === modelIdFromCookie) ? 
    modelIdFromCookie : 
    (availableModels[0]?.id || DEFAULT_MODEL_NAME);

  if (!session?.user) {
    return (
      <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-xl font-semibold dark:text-zinc-50">Welcome</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Please sign in to continue
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Link
              href="/login"
              className="w-full px-4 py-2 text-center bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full px-4 py-2 text-center border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        
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

                  {/* Chat history sidebar */}
                  <div className={`w-[300px] h-full fixed transition-all duration-300 ${isCollapsed ? 'translate-x-full opacity-0' : 'right-[600px] opacity-100'} top-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto`}>
                    <SidebarProvider defaultOpen={!isCollapsed}>
                      <AppSidebar user={session?.user} />
                      <SidebarInset>
                        <AuthCheck />
                        <Toaster position="top-center" />
                        {children}
                      </SidebarInset>
                    </SidebarProvider>
                  </div>

                  {/* Chat sidebar */}
                  <div className="w-[600px] h-full fixed right-0 top-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto z-50">
                    <SidebarProvider defaultOpen={!isCollapsed}>
                      <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                          <Chat
                            id={id}
                            initialMessages={[]}
                            selectedModelId={selectedModelId}
                            availableModels={availableModels}
                            selectedVisibilityType="public"
                            isReadonly={false}
                            routePrefix="/market"
                            apiEndpoint="/api/market"  // Add this line to override the default /api/chat endpoint
                          />
                        </div>
                        <DataStreamHandler id={id} />
                      </div>
                    </SidebarProvider>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </ThemeProvider>
      <Analytics />
    </SessionProvider>
  );
}
