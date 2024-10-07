import React from 'react';
import ReactDOMServer from 'react-dom/server';

interface AppProps {
	val: string;
}
const App = ({ val }: AppProps) => (
	<div>
		<h1>Hello!</h1>
		<h2>{val}</h2>
	</div>
);

export function genApp() {
	return ReactDOMServer.renderToString(<App val="Testing" />);
}
