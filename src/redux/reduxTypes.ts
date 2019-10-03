import {ExampleModel} from "./example/exampleTypes";
import {V2Model} from "./v2/v2Types";
import {V3State} from "./v3/v3Types";

type Dispatch = (action: any) => Promise<any>;

export interface DispatchProps {
    dispatch: Dispatch;
}

export interface AppState {
    example: ExampleModel;
    v2: V2Model;
    v3: V3State;
}
