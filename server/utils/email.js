const nodemailer = require('nodemailer');

const sendEmailToSuperAdmin = async ({ user, product }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.SUPER_ADMIN_EMAIL,
    subject: `New Payment: ${product.name}`,
    html: `
      <h2>New Purchase Notification</h2>
      <p><strong>Product:</strong> ${product.name}</p>
      <p><strong>Price:</strong> $${product.price}</p>
      <p><strong>Buyer:</strong> ${user?.name} (${user?.email})</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmailToSuperAdmin };
