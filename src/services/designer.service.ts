import { PrismaClient, Prisma, Designer } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates a new designer and optionally links it to an existing user.
 * @param {Prisma.DesignerCreateInput} designerData - The designer data including optional userId.
 * @returns {Promise<Designer>} The created designer object.
 */
async function createDesigner(designerData: any): Promise<Designer> {
  if (designerData.userId) {
    const userExists = await prisma.user.findUnique({
      where: { id: designerData.userId }
    });
    if (!userExists) {
      throw new Error("User not found: Designer must be linked to a valid user.");
    }
  }

  const designer = await prisma.designer.create({
    data: {
      userId: designerData.userId,
      portfolio: designerData.portfolio || "Default portfolio details",
    },
  });
  return designer;
}

/**
 * Retrieves a designer by their ID.
 * @param {string} designerId - The unique ID of the designer.
 * @returns {Promise<Designer | null>} The designer object if found, or null if not found.
 */
async function getDesignerById(designerId: string): Promise<Designer | null> {
  const designer = await prisma.designer.findUnique({
    where: { id: designerId },
  });
  if (!designer) {
    throw new Error(`Designer with ID ${designerId} not found.`);
  }
  return designer;
}

/**
 * Updates a designer by their ID.
 * @param {string} designerId - The unique ID of the designer to update.
 * @param {Prisma.DesignerUpdateInput} designerData - The designer data updates.
 * @returns {Promise<Designer>} The updated designer object.
 */
async function updateDesigner(designerId: string, designerData: Prisma.DesignerUpdateInput): Promise<Designer> {
  const updatedDesigner = await prisma.designer.update({
    where: { id: designerId },
    data: designerData,
  });
  return updatedDesigner;
}

/**
 * Deletes a designer by their ID.
 * @param {string} designerId - The unique ID of the designer to delete.
 * @returns {Promise<Designer>} The deleted designer object.
 */
async function deleteDesigner(designerId: string): Promise<Designer> {
  await prisma.designer.findUniqueOrThrow({
    where: { id: designerId }
  });

  const deletedDesigner = await prisma.designer.delete({
    where: { id: designerId },
  });
  return deletedDesigner;
}

export {
  createDesigner,
  getDesignerById,
  updateDesigner,
  deleteDesigner
};
