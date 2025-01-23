export const getVerifyEmailTemplates = (url: string) => ({
    subject: "Verify Your Email Address",
    text: `Hi there, 
  
  Thank you for signing up with us! Please click the link below to verify your email address:
  
  ${url}
  
  If you didn’t sign up for this account, you can safely ignore this email.
  
  Best regards,
  The FitSphere Team`,
    html: `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email Address</title>
  <style>
    .verify-button:hover {
      background-color: #4f46e5 !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #333333;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background-color: #6366f1;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Verify Your Email</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hello there,</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Welcome to our awesome community! We're thrilled to have you on board. Just one quick step to get you started:</p>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
          <tr>
            <td align="center">
              <a href= ${url} target="_blank" class="verify-button" style="display: inline-block; padding: 14px 30px; background-color: #6366f1; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 5px; transition: all 0.3s ease;">
                Verify My Email
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 20px; word-break: break-all; color: #6366f1;">https://example.com/verify?token=your-token-here</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you didn't request this email, no worries – you can safely ignore it.</p>
        <p style="font-size: 16px; line-height: 1.5;">Stay cool,<br>The Awesome App Team</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; text-align: center; background-color: #f4f7f9; font-size: 14px; color: #666666;">
        <p style="margin: 0;">© 2023 Awesome App. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>

    `
  });
  

  export const getResetPasswordEmailTemplates = (url: string) => ({
    subject: "Reset Your Password",
    text: `Hi there, 
  
  We received a request to reset your password. Please click the link below to set a new password:
  
  ${url}
  
  If you didn’t request this, you can safely ignore this email.
  
  Best regards, 
  The FitSphere Team`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h2 style="color: #4CAF50; text-align: center;">Reset Your Password</h2>
        <p>Hi there,</p>
        <p>We received a request to reset your password. To proceed, please click the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${url}" style="background-color: #4CAF50; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Reset Password</a>
        </div>
        <p>If the button above doesn’t work, you can copy and paste the following link into your browser:</p>
        <p style="word-wrap: break-word; color: #555;">${url}</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #888; text-align: center;">This email was sent by FitSphere. If you have any questions, please contact us at <a href="mailto:support@fitsphere.com" style="color: #4CAF50; text-decoration: none;">support@fitsphere.com</a>.</p>
      </div>
    `,
  });
  