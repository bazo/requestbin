import React from "react";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ReactPaginate from "react-paginate";

const Pagination = ({ page, pagesCount, onChangePage }) => {
	return (
		<ReactPaginate
			previousLabel={"previous"}
			nextLabel={"next"}
			pageCount={parseInt(pagesCount)}
			marginPagesDisplayed={2}
			pageRangeDisplayed={5}
			forcePage={page - 1}
			onPageChange={({ selected }) => onChangePage(selected + 1)}
			containerClassName={"pagination"}
			subContainerClassName={"pages pagination"}
			pageClassName={"page-item"}
			pageLinkClassName={"page-link"}
			activeClassName={"active"}
		/>
	);
};


export default Pagination;
