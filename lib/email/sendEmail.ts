import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Kandy Saloon" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendInquiryConfirmation = async (to: string, name: string) => {
  return sendEmail({
    to,
    subject: 'Your Inquiry Has Been Received - Kandy Saloon',
    text: `Dear ${name},\n\nThank you for your inquiry. Our team will review your message and get back to you as soon as possible.\n\nBest regards,\nKandy Saloon Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #9333ea;">Kandy Saloon</h1>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for your inquiry. Our team will review your message and get back to you as soon as possible.</p>
        <p>We appreciate your patience as we prepare a response to your specific questions.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background-color: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Our Website</a>
        </div>
        <p>Best regards,<br>Kandy Saloon Team</p>
      </div>
    `
  });
};

export const sendFeedbackConfirmation = async (to: string, name: string) => {
  return sendEmail({
    to,
    subject: 'Thank You for Your Feedback - Kandy Saloon',
    text: `Dear ${name},\n\nThank you for your feedback. We greatly appreciate you taking the time to share your thoughts with us.\n\nBest regards,\nKandy Saloon Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #9333ea;">Kandy Saloon</h1>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for your feedback! We greatly appreciate you taking the time to share your thoughts with us.</p>
        <p>Your feedback helps us improve our services and provide a better experience for all our customers.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background-color: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Our Website</a>
        </div>
        <p>Best regards,<br>Kandy Saloon Team</p>
      </div>
    `
  });
};

export const sendResponseNotification = async (to: string, name: string, subject: string) => {
  return sendEmail({
    to,
    subject: `Response to Your ${subject} - Kandy Saloon`,
    text: `Dear ${name},\n\nWe have responded to your inquiry/feedback. Please check your dashboard to view our response.\n\nBest regards,\nKandy Saloon Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #9333ea;">Kandy Saloon</h1>
        </div>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We have responded to your message regarding "<strong>${subject}</strong>".</p>
        <p>Please check your dashboard to view our response.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/messages" style="background-color: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Response</a>
        </div>
        <p>Best regards,<br>Kandy Saloon Team</p>
      </div>
    `
  });
};
