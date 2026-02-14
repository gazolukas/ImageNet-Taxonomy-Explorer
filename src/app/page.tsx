"use client";

import {
  Heading,
  Stack,
  Card,
  CardSection,
  Text,
} from "@kiwicom/orbit-components";

import { Detail } from "@/components/Detail";
import { Search } from "@/components/Search";
import { Tree } from "@/components/Tree";

const Home = () => {
  return (
    <Stack spacing="600">
        <Stack spacing="200">
          <Heading type="title1">ImageNet Explorer</Heading>
          <Text type="secondary">Browse the ImageNet taxonomy</Text>
        </Stack>
        <Search />
        <Stack flex>
          <Card>
            <CardSection>
              <Stack spacing="400">
                <Heading type="title3" as="h2">
                  Taxonomy tree
                </Heading>
                <Tree />
              </Stack>
            </CardSection>
          </Card>
          <Card>
            <CardSection>
              <Stack spacing="600">
                <Heading type="title3" as="h2">
                  Node details
                </Heading>
                <Detail />
              </Stack>
            </CardSection>
          </Card>
        </Stack>
    </Stack>
  );
};

export default Home;
