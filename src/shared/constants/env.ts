const getEnv = (key : string , defaltvalue?:string) :string =>{
    const value = process.env[key] || defaltvalue;
   
    if(value === undefined){
       throw new Error (`Missing environment variable ${key}`)
    }
    return value;
   }
   
   export const MONGODB_URL = getEnv('MONGODB_URL');
   export const PORT = getEnv('PORT');
   export const NODE_ENV = getEnv('NODE_ENV');
   export const APP_ORIGIN = getEnv('APP_ORIGIN');
   export const JWT_SECRET = getEnv('JWT_SECRET')
   export const SMTP_USER  = getEnv('SMTP_USER');
   export const SMTP_PASS = getEnv('SMTP_PASS');
   export const SENDER_EMAIL = getEnv('SENDER_EMAIL');
   export const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');