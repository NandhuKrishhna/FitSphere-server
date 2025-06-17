"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentBookedTemplate = void 0;
const getAppointmentBookedTemplate = (doctorName, appointmentDate, appointmentTime, amount, patientName) => ({
    subject: "Appointment Confirmation - FitSphere",
    text: `Hi ${patientName}, 
    
    Your appointment has been successfully booked! Here are the details of your appointment:
    
    - Doctor: ${doctorName}
    - Date: ${appointmentDate}
    - Time: ${appointmentTime}
    - Amount: ${amount}
    
    If you have any questions or need to reschedule, please contact us.
  
    Best regards,
    The FitSphere Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
        <style>
          @import url('https://fonts.cdnfonts.com/css/satoshi');
  
          body {
            font-family: 'Satoshi', sans-serif;
          }
        </style>
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
                    <h1 style="color: #000; font-size: 20px; margin: 0 0 20px 0;">
                      ✨ Appointment Confirmed! ✨
                    </h1>
      
                    <!-- Appointment Details Box -->
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                      <p style="color: #000; font-size: 16px; margin: 0 0 10px 0;">
                        <strong>Doctor:</strong> ${doctorName}
                      </p>
                      <p style="color: #000; font-size: 16px; margin: 0 0 10px 0;">
                        <strong>Date:</strong> ${appointmentDate}
                      </p>
                      <p style="color: #000; font-size: 16px; margin: 0 0 10px 0;">
                        <strong>Time:</strong> ${appointmentTime}
                      </p>
                      <p style="color: #000; font-size: 16px; margin: 0 0 10px 0;">
                        <strong>Amount:</strong> ${amount}
                      </p>
                    </div>
      
                    <!-- Main Content Box -->
                    <div style="background-color: rgba(255, 255, 255, 0.9); padding: 25px; border-radius: 15px; margin: 0 10px;">
                      <p style="color: #000; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                        Thank you for booking with FitSphere, ${patientName}! We look forward to serving you.
                      </p>
                      <p style="color: #000; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                        If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.
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
    `,
});
exports.getAppointmentBookedTemplate = getAppointmentBookedTemplate;
