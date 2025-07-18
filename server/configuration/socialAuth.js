const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },
};

// Validate required environment variables
const validateConfig = () => {
  const required = [
    ['GOOGLE_CLIENT_ID', config.google.clientId],
    ['GOOGLE_CLIENT_SECRET', config.google.clientSecret],
    ['FACEBOOK_APP_ID', config.facebook.appId],
    ['FACEBOOK_APP_SECRET', config.facebook.appSecret],
  ];

  const missing = required.filter(([name, value]) => !value);

  if (missing.length > 0) {
    console.warn(
      'Missing required social login environment variables:\n' +
      missing.map(([name]) => `- ${name}`).join('\n') +
      '\nSocial login features will not work properly.'
    );
  }
};

validateConfig();

module.exports = config; 