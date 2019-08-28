import { combineReducers } from "redux";
import { connectRouter } from 'connected-react-router'
import exampleReducer from "./redux/example/exampleReducer";

export default (history: any) => combineReducers({
	router: connectRouter(history),
	example: exampleReducer
});
