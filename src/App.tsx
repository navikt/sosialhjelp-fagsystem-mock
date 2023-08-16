import React from "react";
import configureStore from "./configureStore";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserGuide from "./pages/UserGuide";
import NotFound from "./components/notFound";
import Forside from "./pages/Forside";
import "./App.css";

const store = configureStore();

export const AbsolutePath = "sosialhjelp/fagsystem-mock";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter basename="/sosialhjelp/fagsystem-mock">
        <Routes>
          <Route path="/" element={<Forside />} />
          <Route path="/userguide" element={<UserGuide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
