export const enum CE_ErrorCode {
  // Global
  AuthRequired = 401,
  PermissionDenied = 403,

  // Auth (50xx)

  // User (51xx)
  User_TakeTooMany = 5100,
  User_NoSuchUser = 5101,

  // Problem
}
