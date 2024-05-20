// import { prisma } from "../services";

// const getAllRoles = async (): Promise<any> => {
//   const rolesList = await prisma.role.findMany({
//     include: {
//       permission: true,
//     },
//   });
//   const allRoles: { [key: string]: string[] } = {};
//   rolesList.forEach((role: any) => {
//     allRoles[role.name] = role.permission.map((p: any) => p.name);
//   });

//   const roles = Object.keys(allRoles);
//   const roleRights = new Map(Object.entries(allRoles));

//   return { roles, roleRights };
// };

// export default getAllRoles;

// const allRoles: Record<any, string[]> = {
//   USER: [],
//   SUPER_ADMIN: ["getUsers", "manageUsers", "getProducts", "manageProducts"],
//   ADMIN: ["getProducts", "manageProducts"],
// };

// const roles = Object.keys(allRoles);
// const roleRights = new Map(Object.entries(allRoles));

// export { roles, roleRights };
