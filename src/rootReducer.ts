import { combineReducers } from "redux";
import modelReducer from "./redux/reducer";

const reducer = combineReducers({
  model: modelReducer,
});

export default reducer;
