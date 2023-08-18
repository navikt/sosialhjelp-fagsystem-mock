import React from "react";
import Image from "next/image";
// @ts-ignore
import notfoundimg from "./404.png";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center" }}>
      <p>This is not the web page you are looking for...</p>
      <Image src={notfoundimg} alt={""} width={600} height={600} />
    </div>
  );
};

export default NotFound;
