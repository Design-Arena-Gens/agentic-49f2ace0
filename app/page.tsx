'use client';

import { useState } from 'react';

interface GeneratedContent {
  hook: string;
  script: string;
  endingTwist: string;
  soraPrompt: string;
  research: string;
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');

  const generateContent = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setContent(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setContent(data);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            YouTube Shorts Automation Agent
          </h1>
          <p className="text-xl text-gray-300">
            Generate viral scripts and Sora 2 video prompts in seconds
          </p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mb-8">
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold text-purple-300">
              Enter Your Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The deepest ocean trench, Time travel paradoxes, Ancient lost civilizations"
              className="w-full px-6 py-4 bg-gray-900/80 border-2 border-purple-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-lg"
              onKeyPress={(e) => e.key === 'Enter' && generateContent()}
            />
            <button
              onClick={generateContent}
              disabled={loading}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:scale-100 text-lg shadow-lg"
            >
              {loading ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-red-400 text-center">{error}</p>
          )}
        </div>

        {content && (
          <div className="space-y-6">
            <ContentSection
              title="Deep Research"
              content={content.research}
              onCopy={() => copyToClipboard(content.research)}
            />

            <div className="grid md:grid-cols-3 gap-6">
              <ContentSection
                title="Hook (0-3s)"
                content={content.hook}
                onCopy={() => copyToClipboard(content.hook)}
                compact
              />
              <ContentSection
                title="Ending Twist"
                content={content.endingTwist}
                onCopy={() => copyToClipboard(content.endingTwist)}
                compact
              />
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                <h2 className="text-xl font-bold text-purple-300 mb-4">Quick Stats</h2>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>Duration: 45-60 seconds</p>
                  <p>Aspect Ratio: 9:16</p>
                  <p>Style: Cinematic</p>
                  <p>Type: Faceless</p>
                </div>
              </div>
            </div>

            <ContentSection
              title="Full Script (45-60s)"
              content={content.script}
              onCopy={() => copyToClipboard(content.script)}
            />

            <ContentSection
              title="Sora 2 Video Prompt (Ready to Paste)"
              content={content.soraPrompt}
              onCopy={() => copyToClipboard(content.soraPrompt)}
              highlight
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface ContentSectionProps {
  title: string;
  content: string;
  onCopy: () => void;
  compact?: boolean;
  highlight?: boolean;
}

function ContentSection({ title, content, onCopy, compact, highlight }: ContentSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${highlight ? 'bg-gradient-to-br from-pink-900/50 to-purple-900/50 border-pink-500/50' : 'bg-gray-800/50'} backdrop-blur-lg rounded-xl p-6 border ${highlight ? '' : 'border-purple-500/30'} shadow-xl`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${highlight ? 'text-pink-300' : 'text-purple-300'}`}>
          {title}
        </h2>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className={`text-gray-100 whitespace-pre-wrap ${compact ? 'text-sm' : 'text-base'} leading-relaxed`}>
        {content}
      </div>
    </div>
  );
}
