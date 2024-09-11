import React from 'react';

function Pagination({ currentPage, totalPages, setPage }) {
  const pageNumbers = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination is-centered" role="navigation" aria-label="pagination">
      <button
        className="pagination-previous"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <button
        className="pagination-next"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <ul className="pagination-list">
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              className={`pagination-link ${number === currentPage ? 'is-current' : ''}`}
              onClick={() => setPage(number)}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Pagination;