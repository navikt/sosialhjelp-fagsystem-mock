import React from "react";
import { AbsolutePath } from "../../App";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center" }}>
      <p>This is not the web page you are looking for...</p>
      <img src={`${AbsolutePath}/img/404.png`} alt={""} width={"600px"} />
    </div>
  );
};

export default NotFound;
