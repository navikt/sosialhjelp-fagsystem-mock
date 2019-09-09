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
import Forside from "./pages/Forside";
import NotFound from "./components/notFound";
import Example from "./pages/Example";
import V2 from "./pages/V2";

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
								<Route exact path={"/v1"} component={Forside} />
								<Route exact path={"/v2"} component={V2} />
								<Route exact path="/userguide" component={UserGuide} />
								<Route exact path="/examplepage" component={Example} />
								<Route component={NotFound} />
							</Switch>

						</div>
					</ConnectedRouter>
				</div>
			</IntlProvider>
		</Provider>
	);
};

export default App;
