import {ExampleModel} from "./example/exampleTypes";

type Dispatch = (action: any) => Promise<any>;

export interface DispatchProps {
    dispatch: Dispatch;
}

export interface AppState {
    example: ExampleModel;
}
