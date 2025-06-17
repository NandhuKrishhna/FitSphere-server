"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingApprovalEmailTemplate = void 0;
const getPendingApprovalEmailTemplate = () => ({
    subject: "Registration Under Review",
    text: `Hi , 
  
  Thank you for signing up with us! Please use the following OTP to verify your email address:
  
  If you didn’t sign up for this account, you can safely ignore this email.
  
  Best regards,
  The FitSphere Team`,
    html: `
     <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Registering!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 400px; border-collapse: collapse; background-color: #E6E6FA; border-radius: 20px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 30px 20px;">
                            <!-- Check Icon -->
                            <div style="background-color: #4CAF50; width: 50px; height: 50px; border-radius: 25px; margin-bottom: 20px; display: inline-flex; align-items: center; justify-content: center;">
                                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OPH6ohG3iFN25adc4J8ff5TXQELYtc.png" alt="Success" style="width: 30px; height: 30px;">
                            </div>

                            <!-- Title -->
                            <h1 style="color: #000; font-size: 24px; margin: 0 0 20px 0;">
                                ✨ Thank You for Registering! ✨
                            </h1>

                            <!-- Email Send Button -->
                            <div style="background-color: #90EE90; color: #000; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px;">
                                <span style="font-size: 14px;">Check your inbox with an email with all details.</span>
                            </div>

                            <!-- Main Content Box -->
                            <div style="background-color: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 15px; margin: 0 10px;">
                                <p style="color: #000; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                    Your application has been successfully submitted.
                                </p>
                                <p style="color: #000; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                    Our team will review your details and verify your credentials to ensure a seamless experience for you and our users.
                                </p>
                                <p style="color: #000; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                    The approval process may take 24-48 hours.
                                </p>
                                <p style="color: #000; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                    Once your application is approved, you will receive a confirmation email, and your account will be activated.
                                </p>
                                <p style="color: #000; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                    If you have any questions in the meantime, feel free to contact our support team at<br>
                                    <a href="mailto:fitSpheresupport@gmail.com" style="color: #4169E1; text-decoration: none;">fitSpheresupport@gmail.com</a>
                                </p>
                                <p style="color: #000; font-size: 14px; line-height: 1.6; margin: 0;">
                                    Thank you for joining <span style="color: #4169E1; font-weight: bold;">FitSphere</span>!<br>
                                    We're excited to have you on board.
                                </p>
                            </div>

                            <!-- Footer Logo -->
                            <div style="margin-top: 30px;">
                                <span style="color: #4169E1; font-size: 20px; font-weight: bold;">FitSphere</span>
                                <span style="color: #4CAF50; font-size: 20px;">●</span>
                            </div>
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
exports.getPendingApprovalEmailTemplate = getPendingApprovalEmailTemplate;
