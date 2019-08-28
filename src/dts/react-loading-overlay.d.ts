declare module "react-loading-overlay" {
    import * as React from "react";


    interface LoadingOverlayProps {
        active: boolean;
        spinner: any;
    }

    export class LoadingOverlay extends React.Component<LoadingOverlayProps, {}> {}
}
