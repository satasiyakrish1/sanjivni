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

function isQuotaOrRateLimitError(err) {
  const msg = (err && (err.message || err.toString())) || '';
  return /quota|rate limit|429/i.test(msg);
}

const HEALTH_RELATED_PROMPT = `Analyze the following text and determine if it describes health-related symptoms or medical conditions. 
Consider symptoms, pain, discomfort, or any health concerns. 
Respond with 'yes' if health-related, 'no' otherwise.\n\nText: "{text}"`;

const HERBAL_REMEDY_PROMPT = `You are an expert in herbal medicine and natural remedies. 
Create a concise yet rich, user-tailored herbal remedy plan for these symptoms: "{symptoms}"

Rules:
- OUTPUT MUST BE MARKDOWN
- INCLUDE ONLY RELEVANT SECTIONS; OMIT ANY IRRELEVANT SECTIONS
- NO legal disclaimers, no generic safety boilerplate, no general wellness tips
- Avoid repeating headings without content

Suggested structure (use only those that apply):

### 🌿 Recommended Herbs
- 5–8 herbs with brief rationale (include scientific names in italics)

### 🍵 Preparation Methods
- Tea/Infusion (precise measurements + numbered steps)
- Tincture (if appropriate)
- Topical application (ONLY if clearly relevant to the symptoms)

### 🗓️ Daily Schedule
- 3–5 concise bullet points mapping herbs to times of day

### 📋 Specific Instructions
- 6–10 targeted, practical steps tailored to the described symptoms

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
  const lower = text.toLowerCase();
  const disallowed = [
    /\b(api\s*key|secret\s*key|private\s*key|token|password|credentials|otp|credit\s*card|cvv|bank|upi|wallet|crypto)\b/i,
    /\b(socket|webpack|react|javascript|python|java|nodejs|npm|yarn|git|github|docker|kubernetes|sql|mongodb|firebase)\b/i,
    /\b(algorithm|code\b|coding|program\w*|compile|debug)\b/i,
    /\b(homework|assignment|exam\b|test\b)\b/i,
    /\b(hack|exploit|bypass|jailbreak|crack)\b/i
  ];
  if (disallowed.some((r) => r.test(lower))) {
    return false;
  }
  if (/\b(give|share|send|tell)\b.*\b(key|token|password|credentials)\b/i.test(lower)) {
    return false;
  }
  if (!googleGenAI) return true; // let it pass if no key
  try {
    const prompt = HEALTH_RELATED_PROMPT.replace('{text}', text);
  const model = googleGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent([{ text: prompt }]);
  const answer = result?.response?.text?.().trim().toLowerCase() || 'yes';
        return answer.startsWith('yes');
  } catch (err) {
    if (isQuotaOrRateLimitError(err)) {
      // On quota/rate limit issues, allow the request to proceed rather than failing hard
      return true;
    }
    // For other unexpected errors, default to true to avoid blocking user flow
    return true;
  }
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
  try {
  const sanitized = symptoms.replace(/[\n\r\t]/g, ' ').substring(0, 1000);
  const model = googleGenAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent([{ text: HERBAL_REMEDY_PROMPT.replace('{symptoms}', sanitized) }]);
  let text = result?.response?.text?.() || '';
  text = stripIrrelevantSections(symptoms, text);
  if (!text || text.length < 40) {
      // If model returns too little, fallback gracefully
      const fallback = generateFallbackHerbalRemedy(symptoms);
      return stripIrrelevantSections(symptoms, fallback);
  }
  return text;
  } catch (err) {
    if (isQuotaOrRateLimitError(err)) {
      const fallback = generateFallbackHerbalRemedy(symptoms);
      return stripIrrelevantSections(symptoms, fallback);
    }
    // Unexpected error: still offer a usable fallback instead of 500
    const fallback = generateFallbackHerbalRemedy(symptoms);
    return stripIrrelevantSections(symptoms, fallback);
  }
}

function generateFallbackHerbalRemedy(symptoms) {
  const text = String(symptoms || '');
  const s = text.toLowerCase();

  // Deterministic hash to vary selections per different inputs
  const hash = Array.from(text).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const pickByHash = (arr, offset = 0) => arr[(hash + offset) % arr.length];
  const normalizeHerbName = (label) => (label || '').split('(')[0].trim().toLowerCase();

  // Categories with multiple options for variety
  const categories = [
    {
      key: 'respiratory',
      match: /(cold|cough|sore throat|congest|flu|phlegm|runny nose|sinus|breath|wheeze)/,
      options: [
        { herb: 'Tulsi (Ocimum sanctum)', why: 'traditionally used for respiratory comfort and throat soothing', prep: 'Infusion: 1–2 tsp dried leaves in 250 ml hot water, steep 8–10 min; add ginger and honey when warm.' },
        { herb: 'Mulethi/Licorice (Glycyrrhiza glabra)', why: 'demulcent properties may ease throat irritation', prep: 'Decoction: 1 tsp shredded root simmered 10–12 min in 250 ml water.' },
        { herb: 'Thyme (Thymus vulgaris)', why: 'aromatic herb used for chest comfort', prep: 'Infusion: 1 tsp dried thyme, steep 7–9 min; inhale vapors and sip warm.' },
        { herb: 'Adulsa/Vasaka (Justicia adhatoda)', why: 'traditionally used for productive cough', prep: 'Decoction: 1 tsp dried leaves simmered 8–10 min; sip warm.' },
        { herb: 'Elderflower (Sambucus nigra)', why: 'used for nasal comfort and sweating support', prep: 'Infusion: 1–2 tsp flowers steeped 8–10 min.' }
      ]
    },
    {
      key: 'digestive',
      match: /(indigestion|gas|bloat|nausea|stomach|acid|reflux|constipation|diarrhea|ibs|cramp)/,
      options: [
        { herb: 'Peppermint (Mentha × piperita)', why: 'may support digestion and ease gas/bloating', prep: 'Infusion: 1 tsp dried leaves in 250 ml hot water, steep 7–9 min.' },
        { herb: 'Fennel (Foeniculum vulgare)', why: 'traditionally chewed after meals for post‑prandial heaviness', prep: 'Chew 1/2–1 tsp seeds after meals or steep as tea 8–10 min.' },
        { herb: 'Ginger (Zingiber officinale)', why: 'warming carminative for nausea and sluggish digestion', prep: 'Decoction: 4–5 thin slices simmered 8–10 min; add lemon/honey.' },
        { herb: 'Ajwain/Carom (Trachyspermum ammi)', why: 'traditional carminative for gas and cramps', prep: 'Infusion: 1/2 tsp seeds crushed; steep 7–9 min.' },
        { herb: 'Coriander seed (Coriandrum sativum)', why: 'cooling digestive support', prep: 'Infusion: 1 tsp lightly crushed seeds; steep 8–10 min.' }
      ]
    },
    {
      key: 'stress_sleep',
      match: /(stress|anxiety|sleep|insomnia|tension|restless|worry|panic)/,
      options: [
        { herb: 'Ashwagandha (Withania somnifera)', why: 'adaptogenic support for stress resilience and sleep quality', prep: 'Powder: 1/4–1/2 tsp in warm milk/water at night.' },
        { herb: 'Chamomile (Matricaria chamomilla)', why: 'gentle calming herb before bedtime', prep: 'Infusion: 1–2 tsp flowers in 250 ml hot water, steep 8–10 min.' },
        { herb: 'Lavender (Lavandula angustifolia)', why: 'aromatic relaxation support', prep: 'Infusion: 1 tsp flowers steeped 5–7 min; or inhale aroma before sleep.' },
        { herb: 'Brahmi/Gotu Kola (Bacopa monnieri)', why: 'traditional support for calm focus', prep: 'Infusion: 1 tsp dried herb; steep 7–9 min.' },
        { herb: 'Lemon balm (Melissa officinalis)', why: 'uplifting calm for mind and digestion', prep: 'Infusion: 1 tsp dried leaves steeped 6–8 min.' }
      ]
    },
    {
      key: 'pain_inflammation',
      match: /(pain|aches|joint|muscle|inflammation|migraine|headache|arthritis|soreness|backache)/,
      options: [
        { herb: 'Turmeric (Curcuma longa)', why: 'curcuminoids traditionally used for inflammatory discomfort', prep: 'Golden milk: 1/4 tsp powder + pinch black pepper in warm milk 1×/day.' },
        { herb: 'Willow bark (Salix alba)', why: 'salicin source traditionally used for aches', prep: 'Decoction: 1 tsp bark simmered 10–12 min; avoid if salicylate‑sensitive.' },
        { herb: 'Ginger (Zingiber officinale)', why: 'warming herb that may support circulation and relieve aches', prep: 'Decoction: 4–5 thin slices simmered 8–10 min; add lemon/honey.' },
        { herb: 'Nirgundi (Vitex negundo)', why: 'traditionally used topically for joint/muscle comfort', prep: 'Topical: warm leaf poultice on affected area 15–20 min.' },
        { herb: 'Boswellia/Salai guggul (Boswellia serrata)', why: 'traditionally used for joint comfort', prep: 'Powder: 250–500 mg with warm water after meals.' }
      ]
    },
    {
      key: 'skin',
      match: /(skin|rash|itch|acne|eczema|dermatitis|psoriasis|hives)/,
      options: [
        { herb: 'Neem (Azadirachta indica)', why: 'traditionally used for skin comfort and clarity', prep: 'Infusion: 1/2 tsp dried leaves steeped 5–7 min; for taste, blend with tulsi/mint.' },
        { herb: 'Calendula (Calendula officinalis)', why: 'soothing herb for irritated skin', prep: 'Infusion: 1 tsp petals steeped 7–9 min; can cool and use as gentle rinse.' },
        { herb: 'Turmeric (Curcuma longa)', why: 'supportive for inflammatory skin discomfort', prep: 'Paste: pinch turmeric + water; apply as spot for 10–15 min, rinse.' },
        { herb: 'Aloe vera (Aloe barbadensis)', why: 'cooling gel traditionally used for soothing skin', prep: 'Topical: apply fresh gel thin layer 1–2×/day.' },
        { herb: 'Manjishtha (Rubia cordifolia)', why: 'traditional skin health support', prep: 'Decoction: 1 tsp root simmered 10 min; cool before use as rinse.' }
      ]
    }
  ];

  // Extract basic qualifiers
  const durationMatch = s.match(/(\b\d+\s*(day|days|week|weeks|month|months)\b)/);
  const severityMatch = s.match(/(mild|moderate|severe|intense|worst)/);
  const timeRef = durationMatch ? durationMatch[1] : null;
  const severityRef = severityMatch ? severityMatch[1] : null;

  // Build personalized picks with simple scoring and cross-category herb dedupe
  const usedNames = new Set();
  const matchedCategoryPicks = [];
  const matchScores = categories.map((cat) => {
    let score = 0;
    try {
      if (cat.match && cat.match.test(s)) score += 2;
    } catch (_) {}
    return { cat, score };
  }).filter(x => x.score > 0);

  // Keep natural order but prioritize matched categories
  const prioritized = categories.filter(c => matchScores.find(m => m.cat.key === c.key));
  prioritized.slice(0, 4).forEach((cat, idx) => {
    const picks = [];
    // Deterministic ordering by hash
    const ordered = cat.options.map((opt, j) => ({ opt, key: (hash + idx + j * 17) % 101 }))
      .sort((a, b) => a.key - b.key)
      .map(x => x.opt);
    for (let i = 0; i < ordered.length && picks.length < 3; i++) {
      const candidate = ordered[i];
      const nameKey = normalizeHerbName(candidate.herb);
      if (usedNames.has(nameKey)) continue;
      usedNames.add(nameKey);
      picks.push(candidate);
    }
    if (picks.length) matchedCategoryPicks.push({ category: cat.key, herbs: picks });
  });

  // If no category matched, provide a general wellness set varied by hash
  if (matchedCategoryPicks.length === 0) {
    const general = [
      { herb: 'Ginger (Zingiber officinale)', why: 'broad support for digestion and general comfort', prep: 'Decoction: 4–5 thin slices simmered 8–10 min; add lemon/honey.' },
      { herb: 'Tulsi (Ocimum sanctum)', why: 'general wellness and respiratory comfort', prep: 'Infusion: 1–2 tsp dried leaves in 250 ml hot water, steep 8–10 min.' },
      { herb: 'Lemon balm (Melissa officinalis)', why: 'uplifting calm for mind and digestion', prep: 'Infusion: 1 tsp dried leaves steeped 6–8 min.' }
    ];
    matchedCategoryPicks.push({ category: 'general', herbs: [pickByHash(general, 1), pickByHash(general, 2)] });
  }

  // Limit to 3–4 categories for focus
  const selectedCategories = matchedCategoryPicks.slice(0, 4);

  // Build per-category sections
  const perCategorySections = selectedCategories.map(group => {
    const lines = group.herbs.map(h => `- ${h.herb}: ${h.why}`).join('\n');
    const preps = group.herbs.map(h => `- ${h.prep}`).join('\n');
    const titleMap = {
      respiratory: 'Breath & Throat Support',
      digestive: 'Digestive Comfort',
      stress_sleep: 'Calm & Sleep',
      pain_inflammation: 'Aches & Inflammation',
      skin: 'Skin Comfort',
      general: 'General Support'
    };
    const iconMap = {
      respiratory: '🌬️',
      digestive: '🍽️',
      stress_sleep: '🌙',
      pain_inflammation: '⚡',
      skin: '🧴',
      general: '🌿'
    };
    const title = `${iconMap[group.category] || '🌿'} ${titleMap[group.category] || 'Support'}`;
    return `### ${title}\n${lines}\n\n**Prep**\n${preps}`;
  }).join('\n\n');

  // Always include a General Support section with explicit steps
  const hasGeneral = selectedCategories.some(g => g.category === 'general');
  const generalHerbs = [
    { herb: 'Ginger (Zingiber officinale)', why: 'broad support for digestion and general comfort', prep: 'Decoction: 4–5 thin slices simmered 8–10 min; add lemon/honey.' },
    { herb: 'Tulsi (Ocimum sanctum)', why: 'general wellness and respiratory comfort', prep: 'Infusion: 1–2 tsp dried leaves in 250 ml hot water, steep 8–10 min.' },
    { herb: 'Lemon balm (Melissa officinalis)', why: 'uplifting calm for mind and digestion', prep: 'Infusion: 1 tsp dried leaves steeped 6–8 min.' },
    { herb: 'Cinnamon (Cinnamomum verum)', why: 'warming circulatory and digestive support', prep: 'Decoction: 1 small stick simmered 8–10 min.' },
    { herb: 'Spearmint (Mentha spicata)', why: 'gentle digestive and refreshing support', prep: 'Infusion: 1 tsp dried leaves steeped 7–9 min.' }
  ];
  const generalHerbLines = generalHerbs.map(h => `- ${h.herb}: ${h.why}`).join('\n');
  const generalPrepLines = generalHerbs.map(h => `- ${h.prep}`).join('\n');
  const generalSteps = [
    '1) Morning: Prepare a mild tulsi or ginger infusion and sip warm.',
    '2) Midday: If needed, choose lemon balm or spearmint infusion after lunch.',
    '3) Evening: Optional cinnamon decoction for warmth and comfort.',
    '4) Rotate herbs daily rather than combining many at once.',
    '5) Keep a simple log of what felt best and any sensitivities.'
  ].join('\n');
  const generalSection = hasGeneral
    ? `### 🌿 General Support — Steps to Use\n${generalSteps}`
    : `### 🌿 General Support\n${generalHerbLines}\n\n**Prep**\n${generalPrepLines}\n\n**Steps to Use**\n${generalSteps}`;

  const personalizedTips = [
    timeRef ? `- Since this has lasted ${timeRef}, follow the routine daily for 7–10 days before judging results.` : null,
    severityRef ? `- Your symptoms sound ${severityRef}. Start with milder preparations; increase strength only if well tolerated.` : null,
    '- Step 1: Prepare the first infusion fresh; do not reboil.',
    '- Step 2: Space different herbs by at least 60–90 minutes to assess tolerance.',
    '- Step 3: Maintain hydration; prefer warm water through the day.',
    '- Step 4: Observe any sensitivity (rash, stomach upset); discontinue the suspected herb.',
    '- Step 5: Keep meals light and regular to support digestion.',
    '- Step 6: Track symptoms morning/evening to identify what helps most.'
  ]
  .concat(/reflux|gerd|acid/i.test(s) ? ['- If reflux is present, prefer ginger/fennel over peppermint.'] : [])
  .concat(/insomnia|sleep|night/i.test(s) ? ['- For sleep issues, avoid stimulating herbs/aromas after sunset.'] : [])
  .filter(Boolean).join('\n');

  // Quick daily schedule synthesized from chosen categories (3–5 bullets)
  const schedule = (() => {
    const slots = [];
    selectedCategories.forEach((group, idx) => {
      const first = group.herbs[0];
      if (!first) return;
      const when = ['Morning', 'Midday', 'Evening', 'Bedtime'][idx % 4];
      slots.push(`- ${when}: ${first.herb.split('(')[0].trim()} — ${first.prep.replace('Infusion:', '').replace('Decoction:', '').trim()}`);
    });
    // extend with a second item if available, capped at 5 bullets total
    selectedCategories.forEach((group, idx) => {
      const second = group.herbs[1];
      if (!second || slots.length >= 5) return;
      const when = ['Late Morning', 'Afternoon', 'Late Evening', 'Optional'][idx % 4];
      slots.push(`- ${when}: ${second.herb.split('(')[0].trim()} — ${second.prep.replace('Infusion:', '').replace('Decoction:', '').trim()}`);
    });
    return slots.slice(0, 5).join('\n');
  })();

  return `${perCategorySections}\n\n${generalSection}\n\n### 🗓️ Daily Schedule\n${schedule}\n\n### 📋 Specific Instructions\n${personalizedTips || '- Follow the routine daily and adjust to your tolerance.'}`;
}

module.exports = {
  checkIfHealthRelated,
  generateHerbalRemedy
};
