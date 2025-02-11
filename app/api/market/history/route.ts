import { auth } from '@/lib/auth';
import { getChatsByUserId } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chats = await getChatsByUserId({ userId: session.user.id });
    return Response.json(chats);
  } catch (error) {
    console.error('Failed to get chats:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}