"use client";

import { useDeferredValue, useState } from "react";
import { useSearch, useTree } from "@/lib/hooks";

export const Search = () => {
  const { navigateTo } = useTree();
  const [searchQuery, setSearchQuery] = useState("");

  const searchValue = useDeferredValue(searchQuery).trim();
  const { data: results, isFetching } = useSearch(searchValue);

  const handleResultClick = async (path: string) => {
    await navigateTo(path);
    setSearchQuery("");
  };

  return (
    <>
      <label className="searchBox">
        <span>Search taxonomy</span>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type a category name or path..."
        />
      </label>
      {searchValue.length > 0 && (
        <section className="searchPanel">
          <div className="searchMeta">
            {isFetching ? "Searching..." : `${results?.length ?? 0} results`}
          </div>
          {results && results.length > 0 && (
            <ul className="searchResults">
              {results.map((result) => (
                <li key={result.path}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(result.path)}
                  >
                    <strong>{result.name}</strong>
                    <span>{result.path}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
};
