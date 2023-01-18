export const enum CE_UserLevel {
  Admin = 1000,
  Manager = 6,
  Internal = 3,
  Paid = 2,
  General = 1,
  NoLogged = 0,
  Blocked = -1000,
}

export const enum CE_Permissions {
  ManageUser = CE_UserLevel.Admin,
  ManageProblem = CE_UserLevel.Manager,
  AccessHomework = CE_UserLevel.Internal,
  AccessProblem = CE_UserLevel.General,
  AccessContest = CE_UserLevel.General,
  AccessSite = CE_UserLevel.NoLogged,
}

export function checkIsAllowed(userLevel: CE_UserLevel, permissions: CE_Permissions) {
  return userLevel >= permissions;
}
