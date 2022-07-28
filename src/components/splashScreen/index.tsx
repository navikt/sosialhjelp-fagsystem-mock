import * as React from "react";
import { useEffect, useState } from "react";
import { AbsolutePath } from "../../App";

interface State {
  showSplashScreen: boolean;
}

const initialState = {
  showSplashScreen: true, //seconds
};

const SplashScreen: React.FC<{}> = ({ children }) => {
  const [state, setState] = useState(initialState as State);

  console.log(window.location.href);
  useEffect(() => {
    setTimeout(() => {
      setState({ ...state, showSplashScreen: false });
    }, 4000);
  });

  if (state.showSplashScreen) {
    return (
      <div className={"splashscreen splashscreen-wrapper"}>
        <div className={"splashscreen-content"}>
          <div className={"splashscreen-img"}>
            <img src={`${AbsolutePath}/img/image3.png`} alt={""} />
          </div>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default SplashScreen;
