export class User {
    constructor(
      public _id: string,
      public name: string,
      public email: string,
      public password: string,
      public isActive: boolean = true,
      public isPremium: boolean = false,
      public role: "user" | "doctor" = "user",
      public isVerfied: boolean = false,
      public status: "blocked" | "deleted" | "active" = "active",
      public createdAt?: Date,
      public updatedAt?: Date
    ) {}
}