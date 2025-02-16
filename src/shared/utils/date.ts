export const oneYearFromNow = (): Date => 
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)


 export const thirtyDaysFromNow = (): Date =>
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

 export const fifteenMinutesFromNow = (): Date =>
    new Date(Date.now() + 15 * 60 * 1000);

 export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
 

 export const fiveMinutesAgo = (): Date =>
    new Date(Date.now() - 5 * 60 * 1000);

 export const oneHourFromNow = (): Date =>
    new Date(Date.now() + 60 * 60 * 1000);

 export const generateOtpExpiration = () : Date =>
    new Date(Date.now() + 5 * 60 * 1000);


export const convertToIST = (dateTime: string | Date) :Date =>{
  const date = new Date(dateTime);
  const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return istDate;
};


export function convertToISTWithOffset(dateTime: string | Date, offsetHours: number = 0): Date {
  const date = new Date(dateTime);
  const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return new Date(istDate.getTime() + offsetHours * 60 * 60 * 1000);
}
