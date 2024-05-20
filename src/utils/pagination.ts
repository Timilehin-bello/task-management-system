import { PrismaClientOptions } from "@prisma/client/runtime/library";
import { prisma } from "../services";
import { Prisma } from "@prisma/client";

interface QueryOptions {
  sortBy?: string;
  limit?: string;
  page?: string;
}

interface QueryResult<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const queryCollection = async <T>(
  model: any,
  filter: any,
  options: QueryOptions
): Promise<QueryResult<T>> => {
  let orderBy: any = {};
  if (options.sortBy) {
    const [field, direction] = options.sortBy.split(":");
    orderBy[field] = direction === "desc" ? "desc" : "asc";
  }

  const limit =
    options.limit && parseInt(options.limit, 10) > 0
      ? parseInt(options.limit, 10)
      : 10;
  const page =
    options.page && parseInt(options.page, 10) > 0
      ? parseInt(options.page, 10)
      : 1;
  const skip = (page - 1) * limit;

  // Count total items matching the filter to calculate total pages
  const totalResults = await model.count({
    where: filter,
  });

  const data = await model.findMany({
    where: filter,
    orderBy: orderBy,
    take: limit,
    skip: skip,
  });

  const totalPages = Math.ceil(totalResults / limit);

  return {
    data,
    page,
    limit,
    totalPages,
    totalResults,
  };
};
