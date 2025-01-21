export class VerificationCode {
    constructor(
      public userId: string,
      public type: string,
      public expiresAt?: Date,
      public createdAt?: Date,
    ) {}
}