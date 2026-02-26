import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

// 페이지를 전부 가져오기 (pagination 처리)
async function getAllPagesFromDatabase(dbId) {
    const pages = [];
    let cursor = undefined;

    while (true) {
        const res = await notion.databases.query({
            database_id: dbId,
            start_cursor: cursor,
            page_size: 100,
        });

        pages.push(...res.results);
        if (!res.has_more) break;
        cursor = res.next_cursor;
    }

    return pages;
}

async function resetCheckboxes(propertyNames) {
    if (!databaseId) throw new Error("NOTION_DATABASE_ID missing");
    const pages = await getAllPagesFromDatabase(databaseId);

    for (const page of pages) {
        const properties = {};
        for (const name of propertyNames) {
            properties[name] = { checkbox: false };
        }

        await notion.pages.update({
            page_id: page.id,
            properties,
        });
    }

    console.log(`Reset done. pages=${pages.length}, props=${propertyNames.join(",")}`);
}

// 실행 인자: noon | five
const mode = process.argv[2];

if (mode === "noon") {
    await resetCheckboxes(["check1","check2","check3","check4","check5","check6","check7","check8","check9"]);
} else if (mode === "five") {
    await resetCheckboxes(["check10","check11"]);
} else {
    throw new Error('Usage: node reset.mjs [noon|five]');
}