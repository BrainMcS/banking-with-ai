import { NextRequest } from 'next/server';
import { isUUID } from '@/lib/utils';
import { getChatById, deleteChatById } from '@/lib/db/queries';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!isUUID(id)) {
    return new Response('Invalid chat ID', { status: 400 });
  }

  try {
    const chat = await getChatById({ id });
    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }
    return Response.json(chat);
  } catch (error) {
    console.error('Failed to get chat:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const { id } = params;

  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!isUUID(id)) {
    return new Response('Invalid chat ID', { status: 400 });
  }

  try {
    await deleteChatById({ id });
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}