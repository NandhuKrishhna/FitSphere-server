export const generateOTP = (): string => (Math.floor(100000 + Math.random() * 900000)).toString();
