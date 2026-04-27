import ReactPaginate from "react-paginate";

interface PaginationProps {
	page: number;
	pagesCount: number;
	onPageChange: (page: number) => void;
}

export function Pagination({
	page,
	pagesCount,
	onPageChange,
}: PaginationProps) {
	if (pagesCount < 2) {
		return null;
	}
	return (
		<ReactPaginate
			previousLabel={"previous"}
			nextLabel={"next"}
			pageCount={pagesCount}
			marginPagesDisplayed={2}
			pageRangeDisplayed={5}
			forcePage={page - 1}
			onPageChange={({ selected }) => onPageChange(selected + 1)}
			containerClassName={"flex list-none gap-1 my-4"}
			pageClassName={""}
			pageLinkClassName={"px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 cursor-pointer"}
			activeLinkClassName={"bg-cyan-800 text-white border-cyan-800 hover:bg-cyan-900 dark:bg-cyan-700 dark:border-cyan-700 dark:hover:bg-cyan-800"}
			previousLinkClassName={"px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 cursor-pointer"}
			nextLinkClassName={"px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 cursor-pointer"}
			disabledLinkClassName={"opacity-50 cursor-not-allowed"}
		/>
	);
}
