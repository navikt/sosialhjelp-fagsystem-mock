import { configureStore } from "@reduxjs/toolkit";
import modelReducer from "./redux/reducer";
import { useDispatch, useSelector } from "react-redux";

const store = configureStore({ reducer: { model: modelReducer } });

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export default store;
