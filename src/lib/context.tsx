"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { childrenOptions } from "./options";

type Context = {
  selectedPath: string | null;
  expanded: Set<string>;
  selectNode: (path: string) => void;
  toggleNode: (path: string) => void;
  navigateTo: (path: string) => Promise<void>;
};

export const Context = createContext<Context | null>(null);

type ProviderProps = {
  children: React.ReactNode;
};

export const Provider = ({ children }: ProviderProps) => {
  const queryClient = useQueryClient();

  const [selectedPath, selectNode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleNode = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  }, []);

  const navigateTo = useCallback(
    async (path: string) => {
      const segments = path.split(" > ");
      const paths = [];

      if (segments.length > 1) {
        let cursor = "";

        for (let i = 0; i < segments.length - 1; i++) {
          cursor = cursor ? `${cursor} > ${segments[i]}` : segments[i];
          paths.push(cursor);
        }

        await Promise.all(
          paths.map((path) =>
            queryClient.ensureQueryData(childrenOptions(path)),
          ),
        );
      }

      setExpanded(new Set(paths));
      selectNode(path);
    },
    [queryClient],
  );

  return (
    <Context.Provider
      value={{
        selectedPath,
        expanded,
        selectNode,
        toggleNode,
        navigateTo,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export function useTree() {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useTree must be used within <Provider>");
  }

  return context;
}
