import { FC } from "react";
import ReactPaginate from "react-paginate";

interface PaginationProps {
	page: number
	pagesCount: number
	onChangePage: (page: number) => void
}

const Pagination: FC<PaginationProps> = ({ page, pagesCount, onChangePage }) => {
	return (
		<ReactPaginate
			previousLabel={"previous"}
			nextLabel={"next"}
			pageCount={pagesCount}
			marginPagesDisplayed={2}
			pageRangeDisplayed={5}
			forcePage={page - 1}
			onPageChange={({ selected }) => onChangePage(selected + 1)}
			containerClassName={"pagination"}
			//subContainerClassName={"pages pagination"}
			pageClassName={"page-item"}
			pageLinkClassName={"page-link"}
			activeClassName={"active"}
		/>
	);
};

export default Pagination;
