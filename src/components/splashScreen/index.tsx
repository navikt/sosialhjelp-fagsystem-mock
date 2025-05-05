import * as React from "react";
import { useEffect, useState } from "react";
import { erDev } from "../../utils/restUtils";
import Image from "next/image";
// @ts-expect-error: TypeScript does not recognize .png files as valid modules. Ensure appropriate type definitions or module declarations are in place if needed.
import splash from "./splashImage.png";
const SplashScreen = ({ children }: React.PropsWithChildren) => {
  const [showSplashScreen, setShowSplashScren] = useState(true);

  useEffect(() => {
    setTimeout(
      () => {
        setShowSplashScren(false);
      },
      erDev() ? 0 : 2000,
    );
  }, []);

  if (showSplashScreen) {
    return (
      <div className={"splashscreen splashscreen-wrapper"}>
        <div className={"splashscreen-content"}>
          <div className={"splashscreen-img"}>
            <Image src={splash} alt={""} />
          </div>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default SplashScreen;
