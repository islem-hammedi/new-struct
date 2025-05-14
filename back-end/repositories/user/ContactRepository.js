const nodemailer = require('nodemailer');
require('dotenv').config();

class ContactRepository {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'khadijabenabdelkader1206@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'qqij aava gtxv hpdz'
      }
    });
  }

  async sendEmail(mailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('EmailRepository error:', error);
      throw error;
    }
  }
}

module.exports = ContactRepository;