const fetch = require('node-fetch');

async function testEndpoint() {
  const url = 'http://localhost:5001/api/herbal-remedy';
  const testSymptoms = 'I have a cough and sore throat';

  console.log('Testing API endpoint...');
  console.log('URL:', url);
  console.log('Request payload:', { symptoms: testSymptoms });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms: testSymptoms }),
    });

    console.log('\nResponse Status:', response.status);
    console.log('Response Headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
    
    const data = await response.json().catch(e => ({}));
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testEndpoint();
