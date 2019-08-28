import React from 'react';
import AppBanner from "./components/appBanner/AppBanner";
import { ConnectedRouter } from "connected-react-router";
import configureStore, {history} from "./configureStore";
import { Provider } from "react-redux";
import {Route, Switch} from "react-router";
import {IntlProvider} from "react-intl";
import {tekster} from "./tekster/tekster";
import './App.less';
import UserGuide from "./pages/UserGuide";
import Forside from "./Forside";

const store = configureStore();

const App: React.FC = () => {
	const language = "nb";
	return (
		<Provider store={store}>
			<IntlProvider defaultLocale={language} locale={language} messages={tekster[language]}>
				<div className="informasjon-side">
					<AppBanner/>
					<ConnectedRouter history={history}>
						<div className="blokk-center">
							<Switch>
								<Route exact path="/" component={Forside} />
								<Route exact path="/userguide" component={UserGuide} />
							</Switch>

						</div>
					</ConnectedRouter>
				</div>
			</IntlProvider>
		</Provider>
	);
};

export default App;
