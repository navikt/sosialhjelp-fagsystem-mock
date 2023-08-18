import { applyMiddleware, compose, legacy_createStore } from "redux";
import reducers from "./rootReducer";
import thunkMiddleware from "redux-thunk";

export default function configureStore() {
  let devtools: any = (f: any) => f;
  if (typeof window !== "undefined") {
    const w = window as any;
    devtools = w.__REDUX_DEVTOOLS_EXTENSION__
      ? w.__REDUX_DEVTOOLS_EXTENSION__()
      : (f: any) => f;
  }

  const store = legacy_createStore(
    reducers,
    compose(applyMiddleware(thunkMiddleware), devtools),
  );
  return store;
}
