import React from 'react';
import {ConnectedRouter} from "connected-react-router";
import configureStore, {history} from "./configureStore";
import {Provider} from "react-redux";
import {Route, Switch} from "react-router";
import {IntlProvider} from "react-intl";
import {tekster} from "./tekster/tekster";
import './App.less';
import UserGuide from "./pages/UserGuide";
import NotFound from "./components/notFound";
import V3 from "./pages/V3";

const store = configureStore();

const App: React.FC = () => {
	const language = "nb";
	return (
		<Provider store={store}>
			<IntlProvider defaultLocale={language} locale={language} messages={tekster[language]}>
				<div className="informasjon-side">
					<ConnectedRouter history={history}>
						<Switch>
							<Route exact path="/" component={V3}/>
							<Route exact path="/userguide" component={UserGuide}/>
							<Route component={NotFound}/>
						</Switch>
					</ConnectedRouter>
				</div>
			</IntlProvider>
		</Provider>
	);
};

export default App;
