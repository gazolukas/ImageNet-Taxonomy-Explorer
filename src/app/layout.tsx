import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImageNet Taxonomy Explorer",
  description: "Ingest, store, search, and visualize the ImageNet taxonomy",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <main className="layout">
            <header>
              <h1>ImageNet Explorer</h1>
            </header>
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
