"use client";

import {
  Alert,
  Loading,
  Text,
  Stack,
  Separator,
} from "@kiwicom/orbit-components";
import { useDetail } from "@/lib/hooks";
import { useTree } from "@/lib/store";
import Field from "./Field";

export const Detail = () => {
  const { selectedPath } = useTree();
  const { data: node, isLoading, error } = useDetail(selectedPath);

  if (error) {
    return (
      <Alert type="critical" icon>
        {error.message}
      </Alert>
    );
  }

  if (isLoading) {
    return <Loading type="inlineLoader" />;
  }

  if (!node) {
    return (
      <Text type="secondary">Select a taxonomy node to inspect metadata.</Text>
    );
  }

  return (
    <Stack spacing="400">
      {node.name && <Field label="Name">{node.name}</Field>}
      {node.path && (
        <>
          <Separator />
          <Field label="Path">{node.path}</Field>
        </>
      )}
      {node.depth > 0 && (
        <>
          <Separator />
          <Field label="Depth">{node.depth}</Field>
        </>
      )}
      {Boolean(node.childCount) && (
        <>
          <Separator />
          <Field label="Children">{node.childCount ?? 0}</Field>
        </>
      )}
      {node.size > 0 && (
        <>
          <Separator />
          <Field label="Size">{node.size}</Field>
        </>
      )}
    </Stack>
  );
};
