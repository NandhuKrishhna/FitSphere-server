export const getVerifyEmailTemplates = (otp: string, name: string) => ({
  subject: "Verify Your Email Address",
  text: `Hi ${name}, 

Thank you for signing up with us! Please use the following OTP to verify your email address:

OTP: ${otp}

If you didn’t sign up for this account, you can safely ignore this email.

Best regards,
The FitSphere Team`,
  html: `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
          <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                      <td style="padding: 40px 30px; text-align: center;">
                          <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Hello, ${name}!</h1>
                          <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">Use the following OTP to complete your action:</p>
                          <div style="background-color: #f0f0f0; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                              <span style="font-size: 36px; font-weight: bold; color: #4a4a4a; letter-spacing: 5px;">${otp}</span>
                          </div>
                          <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-bottom: 0;">This OTP will expire in 10 minutes. Do not share this code with anyone.</p>
                      </td>
                  </tr>
                  <tr>
                      <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                          <p style="color: #999999; font-size: 14px; margin: 0;">If you didn't request this OTP, please ignore this email.</p>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
  </table>
</body>
</html>
  `
});

  

export const getResetPasswordEmailTemplates = (otp: string, name: string) => ({
  subject: "Reset Your Password",
  text: `Hi ${name}, 
  
We received a request to reset your password. Please use the following OTP to reset your password:

OTP: ${otp}

If you didn’t request this, you can safely ignore this email.

Best regards,  
The FitSphere Team`,
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="padding: 40px 30px; text-align: center;">
                                <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Hello, ${name}!</h1>
                                <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">We received a request to reset your password. Use the following OTP to proceed:</p>
                                <div style="background-color: #f0f0f0; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                                    <span style="font-size: 36px; font-weight: bold; color: #4a4a4a; letter-spacing: 5px;">${otp}</span>
                                </div>
                                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-bottom: 0;">This OTP will expire in 10 minutes. Do not share this code with anyone.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                <p style="color: #999999; font-size: 14px; margin: 0;">If you didn’t request a password reset, please ignore this email or contact our support team.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `,
});
