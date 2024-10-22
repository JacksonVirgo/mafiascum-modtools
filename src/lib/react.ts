import ReactDOM from 'react-dom/client';
import { v4 as uuid } from 'uuid';
import $ from 'jquery';

export const renderReact = (component: React.JSX.Element) => {
	const id = uuid();
	const $container = $(
		`<div id="${id}" class="mafia-engine-react-wrapper"></div>`,
	);
	$('body').append($container);

	const root = ReactDOM.createRoot(document.getElementById(id)!);
	root.render(component);

	return $container;
};
