import { Model } from "./types";

export type Dispatch = (action: any) => Promise<any>;

export interface DispatchProps {
  dispatch: Dispatch;
}

export interface AppState {
  model: Model;
}
