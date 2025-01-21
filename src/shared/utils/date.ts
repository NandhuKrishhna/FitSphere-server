export const oneYearFromNow = (): Date => 
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)


 export const thirtyDaysFromNow = (): Date =>
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

 export const fifteenMinutesFromNow = (): Date =>
    new Date(Date.now() + 15 * 60 * 1000);