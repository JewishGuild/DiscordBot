export enum MemberJoinRolesNames {
  Member = "Member"
}
export const MemberJoinRoles: Record<MemberJoinRolesNames, string> = {
  [MemberJoinRolesNames.Member]: process.env.MEMBER_ROLE_ID
};
