require('dotenv').config();
const { sendPaymentNotification } = require('./utils/emailService');

async function testEmail() {
  console.log('Email Configuration Test');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Set' : 'Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.ADMIN_EMAIL) {
    console.log('\nEmail configuration is missing!');
    console.log('Please add these to your .env file:');
    console.log('EMAIL_USER=your_email@gmail.com');
    console.log('EMAIL_PASSWORD=your_app_password');
    console.log('ADMIN_EMAIL=admin@yourcompany.com');
    return;
  }
  
  console.log('\nEmail configuration found!');
  console.log('Testing email sending...');
  
  try {
    const testPayment = {
      id: 'test_' + Date.now(),
      buyer_name: 'Test Customer',
      buyer_email: 'test@example.com',
      product_name: 'Test Product',
      product_price: 500,
      created_at: new Date()
    };
    
    await sendPaymentNotification(testPayment);
    console.log('Test email sent successfully!');
    console.log('Check your admin email inbox.');
    
  } catch (error) {
    console.log('Email sending failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\nThis usually means:');
      console.log('1. You need to use an App Password, not your regular password');
      console.log('2. Enable 2-Factor Authentication on your Google account');
      console.log('3. Generate an App Password from Google Account settings');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\nCheck your EMAIL_USER and EMAIL_PASSWORD');
    }
  }
}

testEmail(); 