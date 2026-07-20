// Shared AI utility. Uses OpenAI gpt-4o-mini.
export async function askAI(prompt, systemPrompt = 'You are a creator monetization expert. Be concise and specific.') {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 500 })
  })
  const json = await res.json()
  if (!res.ok) { console.error('[ai] OpenAI error:', json); return { error: json.error?.message || 'AI request failed' } }
  return { text: json.choices[0].message.content.trim() }
}
