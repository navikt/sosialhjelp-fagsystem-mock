import React from "react";
import configureStore from "./configureStore";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { tekster } from "./tekster/tekster";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserGuide from "./pages/UserGuide";
import NotFound from "./components/notFound";
import V3 from "./pages/V3";

const store = configureStore();

const App: React.FC = () => {
  const language = "nb";
  return (
    <Provider store={store}>
      <IntlProvider
        defaultLocale={language}
        locale={language}
        messages={tekster[language]}
      >
        <div className="informasjon-side">
          <BrowserRouter basename="/sosialhjelp/fagsystem-mock">
            <Routes>
              <Route path="/" element={<V3 />} />
              <Route
                path="/userguide"
                element={<UserGuide appname={"Sosialhjelp Fagsystem Mock"} />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </IntlProvider>
    </Provider>
  );
};

export default App;
