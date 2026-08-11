'use client';

import { useState } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import ErrorMessage from '@/components/tools/ErrorMessage';
import RelatedTools from '@/components/tools/RelatedTools';

const MAX_MATCHES = 500;
const MAX_INPUT_LENGTH = 20000;

export default function RegexTesterClient() {
  const [regex, setRegex] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState('g');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [matchLimitReached, setMatchLimitReached] = useState(false);
  const [error, setError] = useState('');

  const handleTest = () => {
    setError('');
    setMatches([]);
    setMatchLimitReached(false);

    if (!regex) {
      return;
    }

    if (testText.length > MAX_INPUT_LENGTH) {
      setError(`Test text is too long. The maximum supported length is ${MAX_INPUT_LENGTH.toLocaleString()} characters.`);
      return;
    }

    try {
      const regexObj = new RegExp(regex, flags);
      const foundMatches: RegExpMatchArray[] = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regexObj.exec(testText)) !== null) {
          foundMatches.push(match);
          if (foundMatches.length >= MAX_MATCHES) {
            setMatchLimitReached(true);
            break;
          }
        }
      } else {
        match = regexObj.exec(testText);
        if (match) {
          foundMatches.push(match);
        }
      }

      setMatches(foundMatches);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regular expression');
    }
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="Regex Tester"
          description="Test regular expressions with real-time matching"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            <div>
              <label htmlFor="regex-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Regular Expression
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  /
                </span>
                <input
                  id="regex-input"
                  type="text"
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  placeholder="Enter regex pattern"
                  className="block w-full rounded-none rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Flags
              </legend>
              <div className="flex flex-wrap gap-2">
                {['g', 'i', 'm', 's', 'u', 'y'].map((flag) => (
                  <button
                    key={flag}
                    onClick={() => toggleFlag(flag)}
                    aria-pressed={flags.includes(flag)}
                    className={`px-3 py-1 rounded-md text-sm font-mono ${
                      flags.includes(flag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    }`}
                  >
                    {flag}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold">g:</span> global, <span className="font-semibold">i:</span> case-insensitive, <span className="font-semibold">m:</span> multiline, <span className="font-semibold">s:</span> dotAll, <span className="font-semibold">u:</span> unicode, <span className="font-semibold">y:</span> sticky
              </p>
            </fieldset>

            <div>
              <label htmlFor="test-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Test Text
              </label>
              <textarea
                id="test-text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test against the regex"
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={handleTest}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Test Regex
            </button>

            {error && <ErrorMessage message={error} />}

            {matches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Matches ({matches.length}{matchLimitReached ? '+' : ''})
                </label>
                <div className="space-y-2">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Match {index + 1}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Index: {match.index}
                        </span>
                      </div>
                      <code className="block text-sm font-mono text-gray-900 dark:text-white mb-2 break-all">
                        {match[0]}
                      </code>
                      {match.length > 1 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Capture groups:</span>
                          {match.slice(1).map((group, i) => (
                            <span key={i} className="ml-2">
                              ${i + 1}: {group}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matches.length === 0 && regex && testText && !error && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No matches found
              </div>
            )}
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="regex-tester" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About Regex Tester</h2>
          <p>
            Regular expressions (regex) are patterns used to match character combinations in strings. This tool helps you test and debug your regex patterns in real-time.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Enter your regex pattern (without the surrounding slashes)</li>
            <li>Select the appropriate flags for your use case</li>
            <li>Enter test text to match against</li>
            <li>Click &quot;Test Regex&quot; to see all matches</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            This tool processes your regex and test text entirely in your browser. Your data never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
