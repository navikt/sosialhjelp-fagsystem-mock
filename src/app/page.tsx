"use client";

import React, { Suspense, useEffect } from "react";
import Loading from "./loading";
import Forside from ".././content/Forside";
import {
  hentFsSoknadFraFiksEllerOpprettNy,
  setAktivSoknad,
} from "../redux/actions";
import { useSearchParams } from "next/navigation";
import { idFromQueryOrRandomId } from "../redux/reducer";
import { useDispatch } from "react-redux";

export default function Page() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fiksDigisosId = idFromQueryOrRandomId(searchParams);
    console.log("setAktiv", fiksDigisosId);
    dispatch(setAktivSoknad(fiksDigisosId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <Forside />
    </Suspense>
  );
}
