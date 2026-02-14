"use client";

import { useState } from "react";
import {
  InputField,
  Card,
  Stack,
  Text,
  ListChoice,
  Loading,
} from "@kiwicom/orbit-components";
import SearchIcon from "@kiwicom/orbit-components/lib/icons/Search";

import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue, useSearch } from "@/lib/hooks";
import { useTree } from "@/lib/store";

export const Search = () => {
  const queryClient = useQueryClient();
  const { navigateTo } = useTree();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const debounced = useDebouncedValue(searchQuery.trim());
  const { data: results, isFetching } = useSearch(debounced);

  const handleClick = async (path: string) => {
    setLoading(true);
    try {
      await navigateTo(path, queryClient);
      setSearchQuery("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing="200">
      <InputField
        prefix={<SearchIcon />}
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {searchQuery.length > 0 && (
        <Stack spacing="200">
          {loading ? (
            <Loading type="inlineLoader" />
          ) : (
            <>
              <Text size="small" type="secondary">
                {isFetching ? "Searching…" : `${results?.length ?? 0} results`}
              </Text>
              {results &&
                results.map((result) => (
                  <Card key={result.path}>
                    <ListChoice
                      title={result.name}
                      description={result.path}
                      onClick={() => handleClick(result.path)}
                    />
                  </Card>
                ))}
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
};
