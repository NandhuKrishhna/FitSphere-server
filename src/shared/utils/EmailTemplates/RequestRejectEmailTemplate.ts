export const getRejectionEmailTemplate = (name: string, reason: string) => ({
    subject: "Registration Request Rejected",
    text: `Hi ${name}, 
  
    We appreciate your interest in joining Fitsphere. Unfortunately, after reviewing your application, we are unable to approve your registration at this time. 
  
    Reason for rejection: ${reason}
  
    If you believe this was a mistake or need further clarification, feel free to contact us at fitsphere@gmail.com.
  
    Best regards,  
    The Fitsphere Team`,
  
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Request Rejected</title>
        <style>
          .contact-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #333333;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #dc2626;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Registration Request Rejected</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We appreciate your interest in joining Fitsphere. Unfortunately, after reviewing your application, we are unable to approve your registration at this time.</p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><strong>Reason for rejection:</strong> ${reason}</p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you believe this was a mistake or need further clarification, feel free to contact us at <a href="mailto:fitsphere@gmail.com" class="contact-link" style="color: #dc2626; text-decoration: none;">fitsphere@gmail.com</a>.</p>
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
  