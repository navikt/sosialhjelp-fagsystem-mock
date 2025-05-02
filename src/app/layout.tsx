"use client";
import { Metadata } from "next";
import "../App.css";
import React from "react";
import { Provider } from "react-redux";
import store from "../store";

const metadata: Metadata = {
  title: "Fagsystemmock",
  description: "Mocking av fagsystem for sosialhjelp",
};

const store = store();

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <head>
        <link
          rel="preload"
          href="https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div id="root">
          <Provider store={store}>{children}</Provider>
        </div>
      </body>
    </html>
  );
}
