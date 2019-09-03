import { combineReducers } from "redux";
import { connectRouter } from 'connected-react-router'
import exampleReducer from "./redux/example/exampleReducer";
import v2Reducer from "./redux/v2/v2Reducer";

export default (history: any) => combineReducers({
	router: connectRouter(history),
	example: exampleReducer,
	v2: v2Reducer
});