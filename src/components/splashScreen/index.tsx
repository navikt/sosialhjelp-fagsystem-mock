import * as React from "react";
import { useEffect, useState } from "react";
import logo from "./image3.png";
import { erDev } from '../../utils/restUtils';

const SplashScreen: React.FC<{}> = ({ children }) => {
  const [showSplashScreen, setShowSplashScren] = useState(true);

  useEffect(() => {
    setTimeout(() => {
        setShowSplashScren(false);
    }, erDev() ? 0 : 2000);
  }, []);

  if (showSplashScreen) {
    return (
      <div className={"splashscreen splashscreen-wrapper"}>
        <div className={"splashscreen-content"}>
          <div className={"splashscreen-img"}>
            <img src={logo} alt={""} />
          </div>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default SplashScreen;
