"use client";

import { useState } from "react";
import {
  InputField,
  Card,
  Stack,
  Text,
  ListChoice,
} from "@kiwicom/orbit-components";
import SearchIcon from "@kiwicom/orbit-components/lib/icons/Search";

import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue, useSearch } from "@/lib/hooks";
import { useTree } from "@/lib/store";

export const Search = () => {
  const queryClient = useQueryClient();
  const { navigateTo } = useTree();
  const [searchQuery, setSearchQuery] = useState("");
  const searchValue = useDebouncedValue(searchQuery.trim());
  const { data: results, isFetching } = useSearch(searchValue);

  const handleResultClick = async (path: string) => {
    setSearchQuery("");
    await navigateTo(path, queryClient);
  };

  return (
    <Stack spacing="200">
      <InputField
        prefix={<SearchIcon />}
        placeholder="Type a category name or path…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        label="Search taxonomy"
      />

      {searchQuery.length > 0 && (
        <Stack spacing="200">
          <Text size="small" type="secondary">
            {isFetching ? "Searching…" : `${results?.length ?? 0} results`}
          </Text>
          {results &&
            results.map((result) => (
              <Card key={result.path}>
                <ListChoice
                  title={result.name}
                  description={result.path}
                  onClick={() => handleResultClick(result.path)}
                />
              </Card>
            ))}
        </Stack>
      )}
    </Stack>
  );
};
