const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});

// Function to send payment notification to super admin
const sendPaymentNotification = async (paymentDetails) => {
  try {
    console.log('Starting email notification process');
    console.log('Payment details:', paymentDetails);
    
    const { buyer_name, buyer_email, product_name, product_price, created_at } = paymentDetails;
    
    console.log('Email configuration:');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', process.env.ADMIN_EMAIL);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Payment Received - E-commerce Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            New Payment Notification
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">Payment Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Customer Name:</td>
                <td style="padding: 8px 0;">${buyer_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Customer Email:</td>
                <td style="padding: 8px 0;">${buyer_email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Product:</td>
                <td style="padding: 8px 0;">${product_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Amount:</td>
                <td style="padding: 8px 0; color: #27ae60; font-weight: bold;">₹${product_price}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Payment Date:</td>
                <td style="padding: 8px 0;">${new Date(created_at).toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
            <p style="margin: 0; color: #2c3e50;">
              <strong>Payment Status:</strong> Successfully completed
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 14px;">
            <p>This is an automated notification from your e-commerce payment system.</p>
            <p>Payment ID: ${paymentDetails.id}</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment notification email sent successfully');
    return info;
    
  } catch (error) {
    console.error('Error sending payment notification email:', error);
    throw error;
  }
};

module.exports = {
  sendPaymentNotification
}; 