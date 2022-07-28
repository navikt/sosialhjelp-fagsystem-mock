import { combineReducers } from "redux";
import exampleReducer from "./redux/example/exampleReducer";
import modelReducer from "./redux/reducer";

const reducer = combineReducers({
    example: exampleReducer,
    model: modelReducer,
  });

export default reducer;
