"use client";

import { useDeferredValue, useState } from "react";
import {
  InputField,
  Card,
  CardSection,
  Stack,
  Text,
  ListChoice,
} from "@kiwicom/orbit-components";
import SearchIcon from "@kiwicom/orbit-components/lib/icons/Search";

import { useSearch } from "@/lib/hooks";
import { useTree } from "@/lib/context";

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
    <Stack spacing="200">
      <InputField
        prefix={<SearchIcon />}
        placeholder="Type a category name or path…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        label="Search taxonomy"
      />

      {searchValue.length > 0 && (
        <Card>
          <CardSection>
            <Text size="small" type="secondary">
              {isFetching ? "Searching…" : `${results?.length ?? 0} results`}
            </Text>
          </CardSection>
          {results &&
            results.map((result) => (
              <ListChoice
                key={result.path}
                title={result.name}
                description={result.path}
                onClick={() => handleResultClick(result.path)}
              />
            ))}
        </Card>
      )}
    </Stack>
  );
};
