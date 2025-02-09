import { useState } from 'react';
import { ModelSelect } from './ModelSelect';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';

export function Chat() {
  const [modelId, setModelId] = useState(DEFAULT_MODEL_NAME);
  
  const handleSubmit = async (message: string) => {
    const response = await fetch('/api/financial-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        modelId,
      }),
    });
    // ... rest of your submit handler
  };

  return (
    <div>
      <ModelSelect value={modelId} onChange={setModelId} />
      {/* rest of your chat UI */}
    </div>
  );
}