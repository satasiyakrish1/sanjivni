/**
 * Utility to validate environment variables
 * This helps catch missing or invalid environment variables early
 */

const validateEnv = () => {
  const requiredVars = [
    'VITE_BACKEND_URL',
    'VITE_RECAPTCHA_SITE_KEY',
  ];

  const missingVars = [];
  const emptyVars = [];

  // Check for missing or empty variables
  requiredVars.forEach(varName => {
    if (!(varName in import.meta.env)) {
      missingVars.push(varName);
    } else if (!import.meta.env[varName]) {
      emptyVars.push(varName);
    }
  });

  // Special validation for reCAPTCHA site key
  if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (recaptchaKey.length < 30 || !recaptchaKey.startsWith('6L')) {
      console.error(`Invalid reCAPTCHA site key format: ${recaptchaKey.substring(0, 5)}...`);
    }
  }

  // Log any issues found
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (emptyVars.length > 0) {
    console.error(`Empty required environment variables: ${emptyVars.join(', ')}`);
  }

  return missingVars.length === 0 && emptyVars.length === 0;
};

export default validateEnv;