import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import exampleReducer from "./redux/example/exampleReducer";
import modelReducer from "./redux/reducer";

const reducer = (history: any) =>
  combineReducers({
    router: connectRouter(history),
    example: exampleReducer,
    model: modelReducer,
  });

export default reducer;
