const enum AppErrorCode {
    InvalidAccessToken = "InvalidAccessToken",
    MissingRole = "MissingRole",
    InvalidRole = "InvalidRole",
    MissingUserId = "MissingUserId",
    InvalidUserId = "InvalidUserId",
    MissingSessionId = "MissingSessionId",
    InvalidSessionId = "InvalidSessionId",
    MissingRefreshToken = "MissingRefreshToken",
    InvalidRefreshToken = "InvalidRefreshToken",
    MissingPassword = "MissingPassword",
    InsufficientPermission = "InsufficientPermission",
    UserNotFound = "UserNotFound",
    AccountSuspended = "AccountSuspended",
    AccountNotApproved = "AccountNotApproved",

}

export default AppErrorCode;