import { configureStore } from "@reduxjs/toolkit";
import modelReducer from "./redux/reducer";

const store = configureStore({ reducer: { model: modelReducer } });

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;
