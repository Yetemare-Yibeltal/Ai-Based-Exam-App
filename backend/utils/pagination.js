// Build pagination object from query params
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Build pagination metadata for response
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
    from: total === 0 ? 0 : (page - 1) * limit + 1,
    to: Math.min(page * limit, total),
  };
};

// Build sort object from query params
const getSort = (query, allowedFields = [], defaultField = "createdAt") => {
  const sortField = query.sortBy || defaultField;
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  // Only allow sorting on specified fields for security
  if (allowedFields.length > 0 && !allowedFields.includes(sortField)) {
    return { [defaultField]: -1 };
  }

  return { [sortField]: sortOrder };
};

// Build filter object from query params
const getFilter = (query, allowedFilters = []) => {
  const filter = {};

  for (const key of allowedFilters) {
    if (query[key] !== undefined && query[key] !== "") {
      filter[key] = query[key];
    }
  }

  return filter;
};

// Build search filter using regex
const getSearchFilter = (query, searchFields = []) => {
  if (!query.search || searchFields.length === 0) return {};

  const searchRegex = new RegExp(
    query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );

  return {
    $or: searchFields.map((field) => ({ [field]: searchRegex })),
  };
};

// Build date range filter
const getDateRangeFilter = (query, field = "createdAt") => {
  const filter = {};

  if (query.startDate || query.endDate) {
    filter[field] = {};

    if (query.startDate) {
      filter[field].$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter[field].$lte = endDate;
    }
  }

  return filter;
};

// Build complete query options for mongoose
const buildQueryOptions = (
  query,
  allowedSortFields = [],
  allowedFilters = [],
  searchFields = [],
) => {
  const { page, limit, skip } = getPagination(query);
  const sort = getSort(query, allowedSortFields);
  const filter = getFilter(query, allowedFilters);
  const searchFilter = getSearchFilter(query, searchFields);
  const dateFilter = getDateRangeFilter(query);

  const combinedFilter = {
    ...filter,
    ...searchFilter,
    ...dateFilter,
  };

  return {
    page,
    limit,
    skip,
    sort,
    filter: combinedFilter,
  };
};

// Execute paginated query on a mongoose model
const paginateQuery = async (
  model,
  filter = {},
  options = {},
  populateFields = [],
) => {
  const { page, limit, skip, sort } = options;

  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  // Apply population if needed
  if (populateFields.length > 0) {
    for (const field of populateFields) {
      query = query.populate(field);
    }
  }

  // Apply field selection if needed
  if (options.select) {
    query = query.select(options.select);
  }

  const [data, total] = await Promise.all([
    query.lean(),
    model.countDocuments(filter),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  return { data, pagination };
};

// Execute paginated aggregation on a mongoose model
const paginateAggregate = async (
  model,
  pipeline = [],
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const countPipeline = [...pipeline, { $count: "total" }];

  const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

  const [countResult, data] = await Promise.all([
    model.aggregate(countPipeline),
    model.aggregate(dataPipeline),
  ]);

  const total = countResult.length > 0 ? countResult[0].total : 0;
  const pagination = getPaginationMeta(total, page, limit);

  return { data, pagination };
};

module.exports = {
  getPagination,
  getPaginationMeta,
  getSort,
  getFilter,
  getSearchFilter,
  getDateRangeFilter,
  buildQueryOptions,
  paginateQuery,
  paginateAggregate,
};
