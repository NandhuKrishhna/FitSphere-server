"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovalEmailTemplate = void 0;
const URL = 'http//localhost:5000/doctor/login';
const getApprovalEmailTemplate = (name, email) => ({
    subject: "Your Registration Has Been Approved!",
    text: `Hi ${name}, 
    
    Congratulations! Your registration with Fitsphere has been approved.
    
    You can now log in to your account and start offering consultations on our platform. 
    
    Log in here: 'http//localhost:5000/doctor/login'
    
    If you have any questions, feel free to contact us at fitsphere@gmail.com.
    
    Best regards,  
    The Fitsphere Team`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Approved</title>
        <style>
          .login-button {
            display: inline-block;
            background-color: #22c55e;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
          }
          .login-button:hover {
            background-color: #16a34a;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #333333;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #22c55e;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">You're Approved!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Congratulations! Your registration with Fitsphere has been approved.</p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">You can now log in to your account and start offering consultations on our platform.</p>
              <p style="text-align: center;">
                <a href="https://fitsphere.com/login" class="login-button">Log In to Your Account</a>
              </p>
              <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">If you have any questions, feel free to contact us at <a href="mailto:fitsphere@gmail.com" style="color: #22c55e; text-decoration: none;">fitsphere@gmail.com</a>.</p>
              <p style="font-size: 16px; line-height: 1.5;">Best regards,<br>The Fitsphere Team</p>
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
exports.getApprovalEmailTemplate = getApprovalEmailTemplate;
