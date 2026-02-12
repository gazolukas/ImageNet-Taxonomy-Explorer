import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Taxonomy } from "@prisma/client";
import { XMLParser } from "fast-xml-parser";

type FlatNode = Pick<Taxonomy, "path" | "name" | "size" | "depth">;

const SOURCE_URL = "https://raw.githubusercontent.com/tzutalin/ImageNet_Utils/refs/heads/master/detection_eval_tools/structure_released.xml"
const SEPARATOR = " > ";
const BATCH_SIZE = 1000;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type XmlSynset = {
  words?: string;
  "@_words"?: string;
  num_subtree?: string | number;
  "@_num_subtree"?: string | number;
  synset?: XmlSynset | XmlSynset[];
};

type XmlAny = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: string | number | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickWords(node: XmlSynset): string {
  return (node.words ?? node["@_words"] ?? "unknown").trim();
}

function pickSubtree(node: XmlSynset): string | number | undefined {
  return node.num_subtree ?? node["@_num_subtree"];
}

function findTopLevelSynsets(value: unknown): XmlSynset[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  const objectValue = value as XmlAny;
  if ("synset" in objectValue) {
    return asArray(objectValue.synset as XmlSynset | XmlSynset[] | undefined);
  }

  for (const nested of Object.values(objectValue)) {
    const found = findTopLevelSynsets(nested);
    if (found.length > 0) {
      return found;
    }
  }

  return [];
}

function flattenSynset(node: XmlSynset, lineage: string[] = []): FlatNode[] {
  const name = pickWords(node);
  const currentPath = [...lineage, name];
  const path = currentPath.join(SEPARATOR);

  const children = asArray(node.synset);
  const descendantRows: FlatNode[] = [];

  for (const child of children) {
    descendantRows.push(...flattenSynset(child, currentPath));
  }

  const row: FlatNode = {
    path,
    name,
    size: descendantRows.length,
    depth: currentPath.length - 1,
  };

  return [row, ...descendantRows];
}

async function loadXml(): Promise<string> {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to download XML: ${response.status} ${response.statusText}. You can set XML_SOURCE_PATH to a local XML file.`,
    );
  }
  return response.text();
}

async function insertInBatches(rows: FlatNode[]): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await prisma.taxonomy.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
}

async function main() {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true,
  });

  const xml = await loadXml();
  const parsed = parser.parse(xml);
  const topLevel = findTopLevelSynsets(parsed);

  const rows: FlatNode[] = [];
  for (const node of topLevel) {
    rows.push(...flattenSynset(node));
  }

  await insertInBatches(rows);
  console.log(`Ingest complete. Processed ${rows.length} taxonomy rows.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
