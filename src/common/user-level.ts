// Attention!
// If you want to add more levels in the future,
// please insert the new value directly,
// do NOT modify the existing level.
export const enum CE_UserLevel {
  Admin = 1000, // Someone can manage anything
  Manager = 500, // Someone can manage content except security
  Internal = 100, // Inner school user (students)
  Paid = 50, // External paid user
  General = 1,
  Blocked = -1000,
}

export const enum CE_Permission {
  ManageSite = CE_UserLevel.Admin,
  ManageUser = CE_UserLevel.Admin,
  ManageProblem = CE_UserLevel.Manager,
  CreatePersonalProblem = CE_UserLevel.Paid,
  AccessProblem = CE_UserLevel.General,
  AccessGroup = CE_UserLevel.Internal,
  AccessHomework = CE_UserLevel.Internal,
  AccessSite = CE_UserLevel.General,
}

export function checkIsAllowed(userLevel: CE_UserLevel, permissions: CE_Permission) {
  return userLevel >= permissions;
}
