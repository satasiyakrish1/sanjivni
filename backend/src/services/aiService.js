const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ApiError } = require('../middleware/errorHandler');
const { GOOGLE_AI_API_KEY, NODE_ENV } = require('../config/config');
const logger = require('./logger');

// Validate API key on startup
if (!GOOGLE_AI_API_KEY) {
  const error = new Error('GOOGLE_AI_API_KEY is not defined in environment variables');
  logger.error('Configuration Error:', error);
  throw error;
}

// Initialize Google AI with error handling
let genAI;
try {
  genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
  logger.info('Google Generative AI initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Google Generative AI:', error);
  throw new Error('Failed to initialize AI service');
}

const HEALTH_RELATED_PROMPT = `Analyze the following text and determine if it describes health-related symptoms or medical conditions. 
Consider symptoms, pain, discomfort, or any health concerns. 
Respond with 'yes' if health-related, 'no' otherwise.\n\nText: "{text}"`;

const HERBAL_REMEDY_PROMPT = `You are an expert in herbal medicine and natural remedies. 
Provide a comprehensive herbal remedy plan for the following symptoms: "{symptoms}"

Structure your response in clear markdown format with the following sections:

### 🌿 Recommended Herbs
- List 3-5 most effective herbs for these symptoms
- Include scientific names in italics
- Note any traditional uses

### 🍵 Preparation Methods
- Tea/Infusion
- Tincture
- Topical application (if applicable)
- Include measurements and step-by-step instructions

### ⏱️ Dosage & Administration
- Recommended dosage for adults
- Frequency
- Best time to take
- Duration of use

### ⚠️ Precautions & Contraindications
- Potential side effects
- Who should avoid this remedy
- Possible drug interactions
- Safety during pregnancy/breastfeeding

### 🏥 When to See a Doctor
- Warning signs that require medical attention
- How long to try the remedy before seeking help
- Conditions that require immediate medical care

### 💡 Additional Tips
- Lifestyle recommendations
- Dietary suggestions
- Other supportive therapies

Format the response in clean markdown with appropriate headers. Be specific, practical, and safety-conscious.`;

async function checkIfHealthRelated(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new ApiError(400, 'Invalid input text for health check');
  }

  try {
    logger.debug('Checking if text is health-related:', { text: text.substring(0, 50) + '...' });
    
    if (!GOOGLE_AI_API_KEY) {
      logger.error('Google AI API key is not configured');
      throw new ApiError(500, 'AI service is not properly configured. Please check server logs.');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 100,
      },
    });
    
    const prompt = HEALTH_RELATED_PROMPT.replace('{text}', text);
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check request timed out after 10 seconds')), 10000)
    );
    
    const generatePromise = (async () => {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text().trim().toLowerCase();
        logger.debug('Health check response:', { answer });
        return answer.startsWith('yes');
      } catch (error) {
        logger.error('Error generating content with Google AI:', {
          error: error.message,
          stack: NODE_ENV === 'development' ? error.stack : undefined,
          prompt: prompt.substring(0, 100) + '...' // Log first 100 chars of prompt
        });
        throw error;
      }
    })();
    
    return await Promise.race([generatePromise, timeoutPromise]);
    
  } catch (error) {
    logger.error('Error in checkIfHealthRelated:', { 
      error: error.message, 
      stack: NODE_ENV === 'development' ? error.stack : undefined 
    });
    
    // Provide more specific error messages
    if (error.message.includes('API key not valid')) {
      throw new ApiError(401, 'Invalid Google AI API key. Please check your configuration.');
    }
    
    if (error.message.includes('quota')) {
      throw new ApiError(429, 'API quota exceeded. Please try again later.');
    }
    
    if (error.message.includes('timed out')) {
      throw new ApiError(504, 'Request to AI service timed out. Please try again.');
    }
    
    throw new ApiError(500, 'Error analyzing symptoms. ' + (NODE_ENV === 'development' ? error.message : 'Please try again later.'));
  }
}

async function generateHerbalRemedy(symptoms) {
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
    throw new ApiError(400, 'Please provide symptoms to get herbal remedy suggestions.');
  }

  try {
    logger.debug('Generating herbal remedy for symptoms:', { 
      symptomsLength: symptoms.length,
      symptomsPreview: symptoms.substring(0, 50) + '...' 
    });
    
    if (!GOOGLE_AI_API_KEY) {
      logger.error('Google AI API key is not configured');
      throw new ApiError(500, 'AI service is not properly configured. Please check server logs.');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2000,
      },
    });
    
    // Sanitize input to prevent prompt injection
    const sanitizedSymptoms = symptoms.replace(/[\n\r\t]/g, ' ').substring(0, 1000);
    const prompt = HERBAL_REMEDY_PROMPT.replace('{symptoms}', sanitizedSymptoms);
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Remedy generation timed out after 30 seconds')), 30000)
    );
    
    const generatePromise = (async () => {
      try {
        logger.debug('Sending request to Google AI with prompt:', { 
          promptLength: prompt.length,
          promptPreview: prompt.substring(0, 100) + '...' 
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        logger.debug('Received response from Google AI:', { 
          responseLength: text?.length || 0,
          responsePreview: text ? text.substring(0, 100) + '...' : 'No response'
        });
        
        if (!text || text.length < 100) {
          throw new ApiError(500, 'Insufficient response from AI service. The response was too short.');
        }
        
        return text;
      } catch (error) {
        logger.error('Error generating content with Google AI:', {
          error: error.message,
          stack: NODE_ENV === 'development' ? error.stack : undefined,
          promptPreview: prompt.substring(0, 100) + '...'
        });
        throw error;
      }
    })();
    
    return await Promise.race([generatePromise, timeoutPromise]);
    
  } catch (error) {
    logger.error('Error in generateHerbalRemedy:', { 
      error: error.message,
      stack: NODE_ENV === 'development' ? error.stack : undefined,
      symptomsPreview: symptoms ? symptoms.substring(0, 50) + '...' : 'No symptoms provided'
    });
    
    if (error instanceof ApiError) throw error;
    
    // Handle specific Google AI errors
    if (error.message.includes('API key not valid')) {
      throw new ApiError(401, 'Invalid Google AI API key. Please check your configuration.');
    }
    
    if (error.message.includes('quota')) {
      throw new ApiError(429, 'API quota exceeded. Please try again later or check your Google Cloud billing.');
    }
    
    if (error.message.includes('timed out')) {
      throw new ApiError(504, 'Request to AI service timed out. The server took too long to respond.');
    }
    
    if (error.message.includes('safety')) {
      throw new ApiError(400, 'The content was blocked due to safety concerns. Please rephrase your symptoms.');
    }
    
    throw new ApiError(500, `Failed to generate remedy. ${NODE_ENV === 'development' ? error.message : 'Please try again later.'}`);
  }
}

module.exports = {
  checkIfHealthRelated,
  generateHerbalRemedy
};
