const { ApiError } = require('../middleware/errorHandler');
const { GOOGLE_API_KEY } = require('../config/config');

let googleGenAI = null;
try {
  if (GOOGLE_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    googleGenAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    console.log('Google Generative AI (Gemini) initialized successfully');
} else {
    console.warn('GOOGLE_API_KEY is missing');
  }
} catch (err) {
  console.warn('Google Generative AI not available:', err?.message || err);
  googleGenAI = null;
}

const HEALTH_RELATED_PROMPT = `Analyze the following text and determine if it describes health-related symptoms or medical conditions. 
Consider symptoms, pain, discomfort, or any health concerns. 
Respond with 'yes' if health-related, 'no' otherwise.\n\nText: "{text}"`;

const HERBAL_REMEDY_PROMPT = `You are an expert in herbal medicine and natural remedies. 
Create a concise, user-tailored herbal remedy plan for these symptoms: "{symptoms}"

Rules:
- OUTPUT MUST BE MARKDOWN
- INCLUDE ONLY RELEVANT SECTIONS; OMIT ANY IRRELEVANT SECTIONS
- NO legal disclaimers, no generic safety boilerplate, no general wellness tips
- Avoid repeating headings without content

Suggested structure (use only those that apply):

### 🌿 Recommended Herbs
- 3–5 herbs with brief rationale (include scientific names in italics)

### 🍵 Preparation Methods
- Tea/Infusion (measurements + steps)
- Tincture (if appropriate)
- Topical application (ONLY if clearly relevant to the symptoms)

### 📋 Specific Instructions
- 3–6 targeted, practical steps tailored to the described symptoms

Keep it focused, specific, and safety-conscious but concise.`;

function stripIrrelevantSections(symptoms, markdown) {
  if (!markdown) return markdown;
  const s = (symptoms || '').toLowerCase();
  const needsTopical = /(skin|rash|itch|acne|eczema|dermatitis|pain|sore|sprain|strain|joint|muscle)/.test(s);
  const removeByHeading = (md, headingPattern) => {
    const regex = new RegExp(`(^|\n)#{2,3}[^\n]*${headingPattern}[^\n]*\n[\s\S]*?(?=(\n##|\n###|$))`, 'gi');
    return md.replace(regex, '$1');
  };
  let out = markdown;
  out = removeByHeading(out, '(dosage|administration)');
  out = removeByHeading(out, '(precautions|contraindications|safety)');
  out = removeByHeading(out, '(when to see a doctor|seek medical attention)');
  out = removeByHeading(out, '(additional tips|additional wellness|lifestyle|dietary)');
  if (!needsTopical) {
    out = removeByHeading(out, '(topical application|topical applications)');
  }
  out = out.replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

async function checkIfHealthRelated(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new ApiError(400, 'Invalid input text for health check');
  }
  if (!googleGenAI) return true; // let it pass if no key
    const prompt = HEALTH_RELATED_PROMPT.replace('{text}', text);
  const model = googleGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent([{ text: prompt }]);
  const answer = result?.response?.text?.().trim().toLowerCase() || 'yes';
        return answer.startsWith('yes');
}

async function generateHerbalRemedy(symptoms) {
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
    throw new ApiError(400, 'Please provide symptoms to get herbal remedy suggestions.');
  }
  if (!googleGenAI) {
    // Fallback: generate a concise, rules-based markdown response
    const fallback = generateFallbackHerbalRemedy(symptoms);
    return stripIrrelevantSections(symptoms, fallback);
  }
  const sanitized = symptoms.replace(/[\n\r\t]/g, ' ').substring(0, 1000);
  const model = googleGenAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent([{ text: HERBAL_REMEDY_PROMPT.replace('{symptoms}', sanitized) }]);
  let text = result?.response?.text?.() || '';
  text = stripIrrelevantSections(symptoms, text);
  if (!text || text.length < 40) {
    throw new ApiError(500, 'Insufficient response from Google AI.');
  }
  return text;
}

function generateFallbackHerbalRemedy(symptoms) {
  const s = (symptoms || '').toLowerCase();
  const picks = [];

  if (/(cold|cough|sore throat|congest|flu|phlegm|runny nose)/.test(s)) {
    picks.push({
      herb: 'Tulsi (Ocimum sanctum)',
      why: 'traditionally used for respiratory discomfort and soothing the throat',
      prep: '- Infusion: 1–2 tsp dried leaves in 250 ml hot water, steep 8–10 min.\n- Add ginger slices and honey once warm.'
    });
    picks.push({
      herb: 'Licorice root (Glycyrrhiza glabra)',
      why: 'demulcent properties that may ease throat irritation',
      prep: '- Decoction: 1 tsp shredded root simmered 10–12 min in 250 ml water.'
    });
  }

  if (/(indigestion|gas|bloat|nausea|stomach|acid|reflux)/.test(s)) {
    picks.push({
      herb: 'Peppermint (Mentha × piperita)',
      why: 'may support digestion and ease gas/bloating',
      prep: '- Infusion: 1 tsp dried leaves in 250 ml hot water, steep 7–9 min.'
    });
    picks.push({
      herb: 'Fennel (Foeniculum vulgare)',
      why: 'traditionally used after meals for post‑prandial heaviness',
      prep: '- Chew 1/2–1 tsp seeds after meals or steep as tea 8–10 min.'
    });
  }

  if (/(stress|anxiety|sleep|insomnia|tension|restless)/.test(s)) {
    picks.push({
      herb: 'Ashwagandha (Withania somnifera)',
      why: 'adaptogenic support for stress and sleep quality',
      prep: '- Powder: 1/4–1/2 tsp in warm milk/water at night.'
    });
    picks.push({
      herb: 'Chamomile (Matricaria chamomilla)',
      why: 'gentle calming effect before bedtime',
      prep: '- Infusion: 1–2 tsp flowers in 250 ml hot water, steep 8–10 min.'
    });
  }

  if (/(pain|aches|joint|muscle|inflammation|headache)/.test(s)) {
    picks.push({
      herb: 'Turmeric (Curcuma longa)',
      why: 'curcuminoids traditionally used for inflammatory discomfort',
      prep: '- Golden milk: 1/4 tsp powder + pinch black pepper in warm milk 1×/day.'
    });
    picks.push({
      herb: 'Ginger (Zingiber officinale)',
      why: 'warming herb that may support circulation and relieve aches',
      prep: '- Decoction: 4–5 thin slices simmered 8–10 min; add lemon/honey.'
    });
  }

  if (picks.length === 0) {
    picks.push({
      herb: 'Ginger (Zingiber officinale)',
      why: 'broad support for digestion and general comfort',
      prep: '- Decoction: 4–5 thin slices simmered 8–10 min; add lemon/honey.'
    });
    picks.push({
      herb: 'Tulsi (Ocimum sanctum)',
      why: 'general wellness and respiratory comfort',
      prep: '- Infusion: 1–2 tsp dried leaves in 250 ml hot water, steep 8–10 min.'
    });
  }

  const prepMethods = picks.map(p => `- ${p.prep}`).join('\n');
  const herbs = picks.map(p => `- ${p.herb}: ${p.why}`).join('\n');

  return `### 🌿 Recommended Herbs\n${herbs}\n\n### 🍵 Preparation Methods\n${prepMethods}\n\n### 📋 Specific Instructions\n- Drink 1 cup, warm, up to 2× per day based on tolerance.\n- Maintain good hydration; avoid irritant foods that worsen symptoms.\n- If symptoms persist, worsen, or are severe, seek medical care.`;
}

module.exports = {
  checkIfHealthRelated,
  generateHerbalRemedy
};
