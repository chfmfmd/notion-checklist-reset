import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

if (!databaseId) throw new Error("NOTION_DATABASE_ID missing");

// 그룹 값(midnight / five)으로 필터링해서, '완료'를 false로 초기화
async function resetByGroup(groupName) {
  const pages = [];
  let cursor = undefined;

  // pagination 처리
  while (true) {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
      filter: {
        property: "그룹",
        select: { equals: groupName },
      },
    });

    pages.push(...res.results);
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }

  for (const page of pages) {
    await notion.pages.update({
      page_id: page.id,
      properties: {
        "완료": { checkbox: false },
      },
    });
  }

  console.log(`Reset group: ${groupName}, count=${pages.length}`);
}

const mode = process.argv[2];

if (mode === "midnight") {
  await resetByGroup("midnight");
} else if (mode === "five") {
  await resetByGroup("five");
} else {
  throw new Error("Usage: node reset.mjs [midnight|five]");
}
