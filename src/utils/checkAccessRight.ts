const isCreator = (project: any, user: any) => {
  return project.creatorId === user.id;
};

const isCollaborator = (project: any, user: any) => {
  return project.collaborators.some(
    (collaborator: any) => collaborator.id === user.id
  );
};

const checkAcessRight = (project: any, user: any, roles: string[] = []) => {
  if (roles.includes("creator") && isCreator(project, user)) {
    return true;
  }
  if (roles.includes("collaborator") && isCollaborator(project, user)) {
    return true;
  }
  return false;
};

export default checkAcessRight;
