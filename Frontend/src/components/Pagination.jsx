import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const DOTS = "…";
const getRange = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start);

function usePagination({
  totalPages,
  currentPage,
  siblingCount = 2,
  boundaryCount = 1,
}) {
  const totalPageNumbers = siblingCount * 2 + 3 + boundaryCount * 2;
  if (totalPages <= totalPageNumbers) return getRange(1, totalPages);

  const leftSiblingIndex = Math.max(
    currentPage - siblingCount,
    boundaryCount + 2
  );
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages - boundaryCount - 1
  );

  const showLeftDots = leftSiblingIndex > boundaryCount + 2;
  const showRightDots = rightSiblingIndex < totalPages - boundaryCount - 1;

  const firstPages = getRange(1, boundaryCount);
  const lastPages = getRange(totalPages - boundaryCount + 1, totalPages);
  const middlePages = getRange(leftSiblingIndex, rightSiblingIndex);

  if (!showLeftDots && showRightDots) {
    const leftCount = boundaryCount + siblingCount * 2 + 2;
    const leftRange = getRange(1, leftCount);
    return [...leftRange, DOTS, ...lastPages];
  }
  if (showLeftDots && !showRightDots) {
    const rightCount = boundaryCount + siblingCount * 2 + 2;
    const rightRange = getRange(totalPages - rightCount + 1, totalPages);
    return [...firstPages, DOTS, ...rightRange];
  }
  return [...firstPages, DOTS, ...middlePages, DOTS, ...lastPages];
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  siblingCount = 2,
  boundaryCount = 1,
}) {
  const pages = usePagination({
    totalPages,
    currentPage,
    siblingCount,
    boundaryCount,
  });

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  // Base button: gray-900 in light, white in dark
  const baseBtn =
    "min-w-[36px] h-9 px-2 inline-flex items-center justify-center rounded-md " +
    "text-[15px] font-medium text-gray-900 dark:text-white " +
    "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300";

  // Active page: #D5BBE0 background, text matches theme
  const activeBtn =
    "bg-[#f5f5f5] text-gray-900 dark:text-white ring-2 ring-[#CA4DFF]/70";

  // Nav chevrons use the same text color as base (so arrows match text color)
  const navBtn = baseBtn;

  const disabled = "opacity-40 pointer-events-none";

  return (
    <nav
      className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 select-none"
      aria-label="Pagination"
    >
      {/* Prev */}
      <button
        type="button"
        className={`${navBtn} ${!canPrev ? disabled : ""}`}
        onClick={() => canPrev && onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <HiChevronLeft className="text-xl text-current" />
      </button>

      {/* Pages */}
      {pages.map((p, idx) =>
        p === DOTS ? (
          <span
            key={`dots-${idx}`}
            className="px-2 text-gray-900 dark:text-white opacity-60"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            className={`${baseBtn} ${currentPage === p ? activeBtn : ""}`}
            onClick={() => onPageChange(p)}
            aria-current={currentPage === p ? "page" : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        type="button"
        className={`${navBtn} ${!canNext ? disabled : ""}`}
        onClick={() => canNext && onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <HiChevronRight className="text-xl text-current" />
      </button>
    </nav>
  );
}
