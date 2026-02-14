import { QueryWrapper } from "@/providers/queryProvider";
import { OrbitWrapper } from "@/providers/orbitProvider";
import { Box, Stack } from "@kiwicom/orbit-components";
import type { Metadata } from "next";
import "@kiwicom/orbit-components/lib/tailwind.css";

export const metadata: Metadata = {
  title: "ImageNet Explorer",
  description: "Ingest, store, search, and visualize the ImageNet taxonomy",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <Stack justify="center">
          <Box width="1200px" margin={{ top: "400" }}>
            <OrbitWrapper>
              <QueryWrapper>{children}</QueryWrapper>
            </OrbitWrapper>
          </Box>
        </Stack>
      </body>
    </html>
  );
}
