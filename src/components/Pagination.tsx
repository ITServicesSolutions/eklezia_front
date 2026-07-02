import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = 'elements',
}) => {
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-5 py-4" style={{ borderTop: '1px solid #d1d8e0' }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neo-text-secondary">
          {startItem}-{endItem} sur {totalItems} {itemLabel}
        </p>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="neo-btn-ghost !py-1.5 !px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Precedent
          </button>
          <span className="text-sm font-semibold text-neo-text">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="neo-btn-ghost !py-1.5 !px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
