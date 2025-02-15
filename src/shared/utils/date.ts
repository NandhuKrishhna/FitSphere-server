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

 interface BookingRequest {
   startTime: string;
   endTime: string;
   date: string;
   consultationType: "audio" | "video";
 }
 
 
 export function convertToIST(reqBody: BookingRequest) {
   const { startTime, endTime, date, ...rest } = reqBody;
 
   const convertTimeToDate = (date: string, time: string): Date => {
     const [hourMinute, meridian] = time.split(" ");
     const [hour, minute] = hourMinute.split(":").map(Number);
     const adjustedHour =
       meridian === "PM" && hour !== 12
         ? hour + 12
         : meridian === "AM" && hour === 12
         ? 0
         : hour;
     const dateObj = new Date(
       `${date}T${adjustedHour.toString().padStart(2, "0")}:${minute
         .toString()
         .padStart(2, "0")}:00+05:30`
     );
     return dateObj;
   };
 
   return {
     ...rest,
     startTime: convertTimeToDate(date, startTime),
     endTime: convertTimeToDate(date, endTime),
     date: new Date(date),
   };
 }
 