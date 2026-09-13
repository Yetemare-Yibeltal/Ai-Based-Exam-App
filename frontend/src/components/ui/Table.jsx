import React from 'react';
import { SkeletonTable } from './Skeleton';
import EmptyState from './EmptyState';

const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyIcon = '📋',
  emptyTitle = 'No data found',
  emptyMessage = '',
  className = '',
  onRowClick = null,
}) => {
  if (isLoading) return <SkeletonTable rows={5} cols={columns.length} />;

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-gray-200 ${className}`}>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 text-gray-700 ${col.cellClassName || ''}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;