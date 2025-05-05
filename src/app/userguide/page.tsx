"use client";

import React, { Suspense } from "react";
import Loading from "../loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
    </Suspense>
  );
}
