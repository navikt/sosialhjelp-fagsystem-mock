"use client";

import React, { Suspense } from "react";
import Loading from "../loading";
import UserGuide from "../.././content/UserGuide";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <UserGuide />
    </Suspense>
  );
}
