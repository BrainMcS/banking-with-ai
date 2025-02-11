export async function generateTitleFromUserMessage({ message }: { 
  message: { 
    role: string; 
    content: string; 
  } 
}): Promise<string> {
  // Extract the first few words or use a default title
  const content = typeof message.content === 'string' 
    ? message.content 
    : 'New Chat';
    
  const title = content
    .split(' ')
    .slice(0, 5)
    .join(' ')
    .trim()
    .concat('...');
    
  return title || 'New Chat';
}