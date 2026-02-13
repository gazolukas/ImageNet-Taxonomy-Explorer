"use client";

import { useId } from "react";
import { OrbitProvider } from "@kiwicom/orbit-components";
import defaultTheme from "@kiwicom/orbit-components/lib/defaultTheme";

type Props = {
  children: React.ReactNode;
};

export const OrbitWrapper = ({ children }: Props) => {
  return (
    <OrbitProvider theme={defaultTheme} useId={useId}>
      {children}
    </OrbitProvider>
  );
};
