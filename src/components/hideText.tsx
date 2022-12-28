import React, { Component } from 'react';

export default class HideText extends Component {
	constructor(...args) {
		super(...args);

		this.state = {
			expanded: false
		};
	}

	toggleExpand = event => {
		event.preventDefault();

		this.setState({
			expanded: !this.state.expanded
		});
	};

	render() {
		let text = this.props.text;
		const isTextLonger = this.props.text.length > this.props.maxLength;
		if (isTextLonger) {
			if (!this.state.expanded) {
				text = text.substring(0, this.props.maxLength);
			}
		}

		let result = [<span key="text">{text}</span>];

		if (isTextLonger) {
			result.push(
				<span
					key="ellipsis"
					className="ellipsis"
					onClick={this.toggleExpand}
				>
					...
				</span>
			);
		}

		return result;
	}
}
