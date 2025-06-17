"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorSignupTemplates = void 0;
const getDoctorSignupTemplates = () => ({
    subject: "Welcome to Fitsphere, Doctor!",
    text: `Hi there, 
    
    Welcome to Fitsphere! We’re excited to have you as part of our doctor community. 
    
    Your account is now pending approval by the admin team. Once approved, you’ll receive an email notification with further details.
    
    Best regards,
    The Fitsphere Team`,
    html: `
      <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Fitsphere, Doctor!</title>
    <style>
      .welcome-button:hover {
        background-color: #4f46e5 !important;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #333333;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <tr>
        <td style="padding: 40px 30px; text-align: center; background-color: #6366f1;">
          <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Welcome to Fitsphere!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hello Doctor,</p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Welcome to Fitsphere! We’re excited to have you as part of our doctor community. Your account is now pending approval by the admin team. Once approved, you’ll receive an email notification with further details.</p>
          <p style="font-size: 16px; line-height: 1.5;">Stay connected,<br>The Fitsphere Team</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 30px; text-align: center; background-color: #f4f7f9; font-size: 14px; color: #666666;">
          <p style="margin: 0;">© 2025 Fitsphere. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `,
});
exports.getDoctorSignupTemplates = getDoctorSignupTemplates;
