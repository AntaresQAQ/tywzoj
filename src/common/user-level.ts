export const enum CE_UserLevel {
  Admin = 1000,
  Manager = 500,
  Internal = 3,
  Paid = 2,
  General = 1,
  Blocked = -1000,
}

export const enum CE_Permissions {
  ManageUser = CE_UserLevel.Admin,
  ManageProblem = CE_UserLevel.Manager,
  AccessSite = CE_UserLevel.General,
}

export function checkIsAllowed(userLevel: CE_UserLevel, permissions: CE_Permissions) {
  return userLevel >= permissions;
}
