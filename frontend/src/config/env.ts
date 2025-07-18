declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      REACT_APP_API_URL?: string;
      REACT_APP_GOOGLE_CLIENT_ID?: string;
    }
  }
}

// Function to get the API URL based on the current environment
const getApiUrl = () => {
  // If REACT_APP_API_URL is set and we're in production, use it
  if (process.env.REACT_APP_API_URL && process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL;
  }

  // In production without REACT_APP_API_URL, use the same origin
  if (process.env.NODE_ENV === 'production') {
    return `${window.location.origin}/api`;
  }

  // In development, always use localhost
  return 'http://localhost:5000/api';
};

export const config = {
  api: {
    url: getApiUrl(),
  },
  oauth: {
    google: {
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    },
  },
};

// Validate required environment variables
const validateConfig = () => {
  const required = [
    ['REACT_APP_GOOGLE_CLIENT_ID', config.oauth.google.clientId],
  ];

  const missing = required.filter(([name, value]) => !value);

  if (missing.length > 0) {
    console.warn(
      'Missing required environment variables:\n' +
      missing.map(([name]) => `- ${name}`).join('\n') +
      '\nPlease check your .env file.'
    );
  }

  // Log the current configuration
  console.log('Current configuration:', {
    apiUrl: config.api.url,
    environment: process.env.NODE_ENV,
    origin: window.location.origin
  });
};

validateConfig();

// This export is needed for the global augmentation to work
export {} 