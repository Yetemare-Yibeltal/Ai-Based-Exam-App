import { useState, useCallback, useMemo } from "react";

const usePagination = (options = {}) => {
  const { initialPage = 1, initialLimit = 10, total = 0 } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(total);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / limit),
    [totalItems, limit],
  );

  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPrevPage = useMemo(() => page > 1, [page]);

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage((p) => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPage((p) => p - 1);
  }, [hasPrevPage]);

  const goToPage = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages],
  );

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  const updateTotal = useCallback((newTotal) => {
    setTotalItems(newTotal);
  }, []);

  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, page - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  }, [page, totalPages]);

  const startItem = useMemo(() => (page - 1) * limit + 1, [page, limit]);
  const endItem = useMemo(
    () => Math.min(page * limit, totalItems),
    [page, limit, totalItems],
  );

  return {
    page,
    limit,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
    startItem,
    endItem,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    reset,
    updateTotal,
    getPageNumbers,
    params: { page, limit },
  };
};

export default usePagination;
