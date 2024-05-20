import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Function to create a new client
/**
 * Creates a new client and links it to an existing user.
 * @param {Prisma.ClientCreateInput} clientBody - The client data including the userId.
 * @returns The created client object including user details.
 */
const createClient = async (clientBody: any) => {
  if (!clientBody.userId) {
    throw new Error("Missing userId: Client must be linked to a valid user.");
  }

  // Optionally, check if the user exists before creating the client.
  const userExists = await prisma.user.findUnique({
    where: { id: clientBody.userId },
  });
  if (!userExists) {
    throw new Error("User not found: The specified userId does not correspond to an existing user.");
  }
console.log(userExists)
  // Create the client and link it to the user.
  return prisma.client.create({
    data: {
      userId: clientBody.userId,
      details: clientBody.details || "Default details",
    },
    include: {
      user: true,
    },
  });  
};
// Function to retrieve a client by their ID, including related entities
const getClientById = async (userId: string) => {
  return prisma.client.findUnique({
    where: { userId },
    include: {
      order: true,
      review: true,
      shoppingCart: true,
      token: true,
    },
  });
};

const updateClientById = async (userId: string, updateBody: Prisma.ClientUpdateInput) => {
  return prisma.client.update({
    where: { userId },
    data: updateBody,
  });
};

// Function to delete a client by their ID
const deleteClientById = async (userId: string): Promise<string> => {
  try {
    // First, verify that the client exists
    const client = await prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new Error(`Client with user ID ${userId} not found.`);
    }

    // Proceed to delete the client
    await prisma.client.delete({
      where: { userId },
    });

    // Return a success message
    return `Client with user ID ${userId} has been successfully deleted.`;
  } catch (error) {
    // Log the error for debugging purposes
    console.error(`Failed to delete client with user ID ${userId}:`, error);

    // Rethrow the error to be handled by the caller or a higher-level error handler
    throw new Error(`Error deleting client with user ID ${userId}: ${error}`);
  }
};

// Function to query clients with filtering and pagination options
const queryClients = async (userFilter: any, options: any) => {
  let orderBy: any = {};
  if (options.sortBy) {
    const [field, direction] = options.sortBy.split(":");
    orderBy[field] = direction === "desc" ? "desc" : "asc";
  }

  const limit = options.limit ? parseInt(options.limit, 10) : 10;
  const page = options.page ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;

  // Adding user-based filter modifications if needed
  const filter = { ...userFilter, userId: userFilter.userId };

  const totalResults = await prisma.client.count({ where: filter });
  const clients = await prisma.client.findMany({
    where: filter,
    orderBy: orderBy,
    take: limit,
    skip: skip,
  });

  return {
    clients,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};


export {
  createClient,
  getClientById,
  updateClientById,
  deleteClientById,
  queryClients
};
