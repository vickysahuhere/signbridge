/**
 * llmGrammarHook.js
 * 
 * Optional, off-by-default external LLM cleanup hook for ISL sentences.
 * 
 * STRICT INVARIANT:
 * This hook is STRICTLY OFF BY DEFAULT (enabled: false).
 * It NEVER makes any network request unless explicitly enabled by user configuration.
 * When disabled or upon any network failure, it returns the deterministic translation immediately.
 */

export const DEFAULT_LLM_CONFIG = Object.freeze({
  enabled: false,
  provider: 'none', // 'gemini' | 'openai' | 'custom'
  apiKey: '',
  endpoint: '',
  model: 'gemini-1.5-flash'
});

/**
 * Format ISL glosses with optional external LLM refinement.
 *
 * @param {string[]} glosses - Raw ISL gloss tokens
 * @param {string} deterministicText - English text produced by client-side rule engine
 * @param {Object} [config={}] - Optional configuration
 * @returns {Promise<string>}
 */
export async function refineWithOptionalLlm(glosses, deterministicText, config = {}) {
  const isEnabled = Boolean(config.enabled && config.apiKey);

  // If disabled (DEFAULT), return deterministic rule engine translation instantly with 0 latency
  if (!isEnabled) {
    return deterministicText;
  }

  try {
    const glossStr = Array.isArray(glosses) ? glosses.join(' ') : String(glosses);
    const systemPrompt = "You are an Indian Sign Language (ISL) linguistic translator. Convert ISL glosses into a natural, polite English sentence. Do not add information. Return only the sentence.";
    const userPrompt = `ISL Glosses: ${glossStr}\nDraft Translation: ${deterministicText}\nNatural English:`;

    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-1.5-flash'}:generateContent?key=${config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
        })
      });

      if (!response.ok) {
        console.warn(`[llmGrammarHook] External API error (${response.status}), falling back to deterministic text.`);
        return deterministicText;
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return candidateText || deterministicText;
    }

    // Custom or OpenAI endpoint format
    if (config.endpoint) {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        return deterministicText;
      }

      const data = await response.json();
      const candidateText = data?.choices?.[0]?.message?.content?.trim();
      return candidateText || deterministicText;
    }

    return deterministicText;
  } catch (err) {
    console.warn('[llmGrammarHook] Refinement failed, using deterministic translation:', err.message);
    return deterministicText;
  }
}
