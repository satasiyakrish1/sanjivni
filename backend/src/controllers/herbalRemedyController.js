const { checkIfHealthRelated, generateHerbalRemedy } = require('../services/aiService');
const { ApiError } = require('../middleware/errorHandler');

const MIN_SYMPTOMS_LENGTH = 10;
const MAX_SYMPTOMS_LENGTH = 1000;

async function validateSymptoms(symptoms) {
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
    throw new ApiError(400, 'Please provide symptoms to get herbal remedy suggestions.');
  }

  const trimmedSymptoms = symptoms.trim();
  
  if (trimmedSymptoms.length < MIN_SYMPTOMS_LENGTH) {
    throw new ApiError(400, `Please provide more details about your symptoms (minimum ${MIN_SYMPTOMS_LENGTH} characters).`);
  }

  if (trimmedSymptoms.length > MAX_SYMPTOMS_LENGTH) {
    throw new ApiError(400, `Symptoms text is too long (maximum ${MAX_SYMPTOMS_LENGTH} characters).`);
  }

  return trimmedSymptoms;
}

async function getHerbalRemedy(symptoms) {
  const validatedSymptoms = await validateSymptoms(symptoms);
  
  const isHealthRelated = await checkIfHealthRelated(validatedSymptoms);
  if (!isHealthRelated) {
    throw new ApiError(400, 'Please provide health-related symptoms to receive relevant herbal remedy suggestions.');
  }

  const remedy = await generateHerbalRemedy(validatedSymptoms);
  return { remedy };
}

// Controller for the API endpoint
async function getHerbalRemedyHandler(req, res, next) {
  try {
    const { symptoms } = req.body;
    const result = await getHerbalRemedy(symptoms);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHerbalRemedy,
  getHerbalRemedyHandler
};
