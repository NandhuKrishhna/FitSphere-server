import bcrypt from 'bcrypt';
export const hashPassword = async(value:string , saltRounds?:number)  =>
    bcrypt.hash(value, saltRounds || 10);


export const comparePassword = async(value:string, hashedValue:string) =>
    bcrypt.compare(value, hashedValue).catch(() => false);