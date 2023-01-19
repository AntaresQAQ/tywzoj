export const enum CE_ErrorCode {
  // Global
  AuthRequired = 401,
  PermissionDenied = 403,

  // Auth (50xx)
  Auth_NoSuchUser = 5000,
  Auth_WrongPassword = 5001,
  Auth_AlreadyLoggedIn = 5002,
  Auth_NotLoggedIn = 5003,
  Auth_DuplicateUsername = 5004,
  Auth_DuplicateEmail = 5005,
  Auth_InvalidEmailVerificationCode = 5006,
  Auth_FailedToSendEmailVerificationCode = 5007,
  Auth_EmailVerificationCodeRateLimited = 5008,

  // User (51xx)
  User_TakeTooMany = 5100,
  User_NoSuchUser = 5101,

  // Problem (52xx)
  Problem_TakeTooMany = 5200,
  Problem_NoSuchProblem = 5201,
}
