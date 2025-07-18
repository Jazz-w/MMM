const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const NUM_REQUESTS = process.env.NUM_REQUESTS || 50;
const CLEAR_TEST_USERS = process.env.CLEAR_TEST_USERS === 'true';

console.log('🧪 Starting metrics generation test');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Number of requests: ${NUM_REQUESTS}`);
console.log(`Clear test users: ${CLEAR_TEST_USERS}`);

// Test data
const testUsers = [
  { 
    firstName: 'Test', 
    lastName: 'User1', 
    email: 'test1@example.com', 
    password: 'password123', 
    phoneNumber: '+21600000001' 
  },
  { 
    firstName: 'Test', 
    lastName: 'User2', 
    email: 'test2@example.com', 
    password: 'password123', 
    phoneNumber: '+21600000002' 
  },
  { 
    firstName: 'Test', 
    lastName: 'User3', 
    email: 'test3@example.com', 
    password: 'password123', 
    phoneNumber: '+21600000003' 
  },
  { 
    firstName: 'Admin', 
    lastName: 'Test', 
    email: 'admin.test@example.com', 
    password: 'password123', 
    phoneNumber: '+21600000004' 
  },
  { 
    firstName: 'Demo', 
    lastName: 'Customer', 
    email: 'demo.customer@example.com', 
    password: 'password123', 
    phoneNumber: '+21600000005' 
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BACKEND_URL}${url}`,
      timeout: 5000
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${url} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.log(`❌ ${method} ${url} - Status: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
    } else if (error.request) {
      // Request made but no response received
      console.log(`❌ ${method} ${url} - No response received: ${error.message}`);
    } else {
      // Something else happened
      console.log(`❌ ${method} ${url} - Error: ${error.message}`);
    }
    return null;
  }
}

async function clearTestUsers() {
  console.log('\n🧹 Clearing existing test users...');
  
  // Try to login with admin credentials and delete test users
  const adminCredentials = {
    email: 'admin.test@example.com',
    password: 'password123'
  };
  
  const loginResult = await makeRequest('/api/auth/login', 'POST', adminCredentials);
  if (loginResult && loginResult.token) {
    console.log('✅ Admin login successful, attempting to clear test users');
    // Note: You may need to implement a cleanup endpoint in your backend
    // This is just a placeholder for the concept
  } else {
    console.log('ℹ️  Admin login failed or no token received, proceeding with registration');
  }
}

async function generateUserRegistrations() {
  console.log('\n📝 Generating user registrations...');
  
  let successCount = 0;
  let existingCount = 0;
  
  for (const user of testUsers) {
    const result = await makeRequest('/api/auth/register', 'POST', user);
    if (result) {
      console.log(`✅ User ${user.email} registered successfully`);
      successCount++;
    } else {
      console.log(`ℹ️  User ${user.email} already exists or registration failed`);
      existingCount++;
    }
    await sleep(100);
  }
  
  console.log(`\n📊 Registration Summary: ${successCount} new users, ${existingCount} existing/failed`);
}

async function generateProductViews() {
  console.log('\n👀 Generating product views...');
  
  // First get products list
  const products = await makeRequest('/api/products');
  
  if (products && products.length > 0) {
    // Generate random product views
    for (let i = 0; i < NUM_REQUESTS; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      await makeRequest(`/api/products/${randomProduct._id}`);
      await sleep(50);
    }
  } else {
    console.log('⚠️  No products found, skipping product views');
  }
}

async function generateCartOperations() {
  console.log('\n🛒 Generating cart operations...');
  
  // Get products first
  const products = await makeRequest('/api/products');
  
  if (products && products.length > 0) {
    for (let i = 0; i < Math.min(NUM_REQUESTS / 2, 25); i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      // Add to cart
      await makeRequest('/api/products/cart', 'POST', {
        productId: randomProduct._id,
        quantity: Math.floor(Math.random() * 3) + 1
      });
      
      await sleep(100);
      
      // Sometimes remove from cart
      if (Math.random() > 0.7) {
        await makeRequest(`/api/products/cart/${randomProduct._id}`, 'DELETE');
        await sleep(100);
      }
    }
  }
}

async function generateGeneralRequests() {
  console.log('\n🌐 Generating general API requests...');
  
  const endpoints = [
    '/api/products',
    '/api/products/categories',
    '/api/auth/check',
    '/metrics'
  ];
  
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    await makeRequest(endpoint);
    await sleep(100);
  }
}

async function checkMetrics() {
  console.log('\n📊 Checking final metrics...');
  await makeRequest('/metrics');
}

async function main() {
  try {
    console.log('\n🚀 Starting metric generation...');
    
    // Test backend connectivity first
    console.log('\n🔍 Testing backend connectivity...');
    const healthCheck = await makeRequest('/api/products');
    if (!healthCheck) {
      console.log('❌ Backend is not accessible. Please ensure:');
      console.log('   1. Backend is running');
      console.log('   2. Port forwarding is active (kubectl port-forward svc/backend-service 5000:5000)');
      console.log('   3. BACKEND_URL is correct');
      process.exit(1);
    }
    
    // Clear test users if requested
    if (CLEAR_TEST_USERS) {
      await clearTestUsers();
    }
    
    const results = {
      userRegistrations: await generateUserRegistrations(),
      productViews: await generateProductViews(),
      cartOperations: await generateCartOperations(),
      generalRequests: await generateGeneralRequests(),
      metrics: await checkMetrics()
    };
    
    console.log('\n✨ Metrics generation completed!');
    console.log('🎯 Your Grafana dashboards should now show data.');
    console.log('📈 Check the following metrics:');
    console.log('   - Total Users');
    console.log('   - HTTP Request Rate');
    console.log('   - Response Times');
    console.log('   - Product Views');
    console.log('   - Cart Operations');
    console.log('\n💡 Tip: Set CLEAR_TEST_USERS=true to clear existing test users before running');
    
  } catch (error) {
    console.error('❌ Error during metrics generation:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping metrics generation...');
  process.exit(0);
});

main(); 