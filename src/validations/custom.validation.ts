const objectId = (value: string, helpers: any) => {
  if (!value.match(/^[0-9a-fA-F]/)) {
    return helpers.message('"{{#label}}" must be a valid Prisma id');
  }
  return value;
};

const password = (value: string, helpers: any) => {
  if (value.length < 8) {
    return helpers.message("password must be at least 8 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "password must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

export { objectId, password };
