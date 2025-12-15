import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a YouTube Shorts Automation Agent specializing in creating viral, faceless YouTube Shorts content.

CHANNEL SPECIFICATIONS:
- Style: Cinematic, suspenseful, viral
- Duration: 45-60 seconds
- Aspect Ratio: 9:16
- Audience: Global (English)
- Goal: Maximum retention & viral potential

YOUR TASKS:

1. DEEP RESEARCH
- Research the topic deeply
- Find 1 shocking/curiosity-driven angle
- Ensure facts are unbelievable but real
- Avoid copyright issues

2. VIRAL SCRIPT (45-60s)
- Strong 0-3 second hook
- Simple, spoken English (TTS friendly)
- Short punchy sentences
- Build suspense every 5-7 seconds
- Powerful twist or question at the end
- NO emojis
- NO narrator name

3. SORA 2 VIDEO PROMPT
Generate ready-to-paste Sora 2 prompt with:
- Ultra-realistic cinematic visuals
- Dramatic lighting
- Slow camera motion
- Intense mood
- Scene-by-scene visual flow
- No text on screen
- No subtitles
- Faceless characters only
- Include video duration
- Include aspect ratio 9:16

OUTPUT FORMAT (JSON):
{
  "research": "Brief research summary with the shocking angle discovered",
  "hook": "The 0-3 second hook",
  "script": "Full 45-60 second script",
  "endingTwist": "The ending twist or question",
  "soraPrompt": "Complete Sora 2 prompt ready to paste"
}`;

    const userPrompt = `Topic: ${topic}

Generate a complete YouTube Shorts package for this topic following all specifications. Make it viral-worthy, suspenseful, and cinematic.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${userPrompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content from Claude');
    }

    const data = await response.json();
    const textContent = data.content[0].text;

    // Extract JSON from the response
    let jsonMatch = textContent.match(/\{[\s\S]*\}/);
    let parsedContent;

    if (jsonMatch) {
      parsedContent = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback parsing if JSON not found
      parsedContent = {
        research: extractSection(textContent, 'RESEARCH', 'HOOK'),
        hook: extractSection(textContent, 'HOOK', 'SCRIPT'),
        script: extractSection(textContent, 'SCRIPT', 'ENDING'),
        endingTwist: extractSection(textContent, 'ENDING', 'SORA'),
        soraPrompt: extractSection(textContent, 'SORA', null),
      };
    }

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

function extractSection(text: string, startMarker: string, endMarker: string | null): string {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return '';

  const contentStart = startIndex + startMarker.length;
  const endIndex = endMarker ? text.indexOf(endMarker, contentStart) : text.length;

  if (endIndex === -1) return text.substring(contentStart).trim();
  return text.substring(contentStart, endIndex).trim();
}
