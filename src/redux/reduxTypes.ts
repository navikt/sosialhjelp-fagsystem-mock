import {ExampleModel} from "./example/exampleTypes";
import {Model} from "./types";

type Dispatch = (action: any) => Promise<any>;

export interface DispatchProps {
    dispatch: Dispatch;
}

export interface AppState {
    example: ExampleModel;
    model: Model
}
