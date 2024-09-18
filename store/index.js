import { configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import car from "./carSlice";
import expandSidebar from "./ExpandSlice";
import { combineReducers } from "redux";

// Ensure this is correct
const reducers = combineReducers({ car, expandSidebar });

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
