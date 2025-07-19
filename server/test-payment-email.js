require('dotenv').config();
const { sendPaymentNotification } = require('./utils/emailService');

async function testPaymentEmail() {
  console.log('Testing payment email functionality');
  
  // Simulate the exact payment data that would be created
  const paymentRecord = {
    id: 51,
    buyer_name: 'Asmi Saxena',
    buyer_email: 'saxenaasmi2004@gmail.com',
    product_name: 'Asmi Premium Plan',
    product_price: 999,
    created_at: new Date(),
    session_id: 'test_session_123'
  };
  
  console.log('Payment record to send:', paymentRecord);
  console.log('sendPaymentNotification function exists:', typeof sendPaymentNotification);
  
  try {
    console.log('Calling sendPaymentNotification');
    await sendPaymentNotification(paymentRecord);
    console.log('Email sent successfully');
    console.log('Check your admin email inbox');
  } catch (error) {
    console.log('Email failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

testPaymentEmail(); 