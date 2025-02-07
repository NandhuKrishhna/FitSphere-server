export const getPendingApprovalEmailTemplate = (name: string, email: string) => ({
    subject: "Registration Under Review",
    text: `Hi ${name}, 
  
  Thank you for registering with Fitsphere! Your application is currently under review by our team. 
  
  We aim to process all registrations within 24 hours. Once approved, you’ll receive an email confirming your account activation. 
  
  If you don’t hear back from us within 24 hours or have any questions, feel free to contact us at fitsphere@gmail.com.
  
  Best regards, 
  The Fitsphere Team`,
    html: `
      <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Under Review</title>
    <style>
      .contact-link:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #333333;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <tr>
        <td style="padding: 40px 30px; text-align: center; background-color: #6366f1;">
          <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Registration Under Review</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hi ${name},</p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for registering with Fitsphere! Your application is currently under review by our team.</p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We aim to process all registrations within 24 hours. Once approved, you’ll receive an email confirming your account activation.</p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you don’t hear back from us within 24 hours or have any questions, feel free to contact us at <a href="mailto:fitsphere@gmail.com" class="contact-link" style="color: #6366f1; text-decoration: none;">fitsphere@gmail.com</a>.</p>
          <p style="font-size: 16px; line-height: 1.5;">Stay fit,<br>The Fitsphere Team</p>
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
  