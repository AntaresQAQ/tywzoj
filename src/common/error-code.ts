// Attention!
// Do NOT modify the existing code.
export const enum CE_ErrorCode {
  // Global
  Unknown = -1,
  AuthRequired = 401,
  PermissionDenied = 403,
  NotFound = 404, // Client Only
  ServerError = 500,
  RecaptchaError = 1000,
  ValidationError = 1001,
  TakeTooMany = 1002,

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
  User_NoSuchUser = 5100,

  // Problem (52xx)
  Problem_NoSuchProblem = 5200,
}
