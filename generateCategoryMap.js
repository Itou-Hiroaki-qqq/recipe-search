import axios from "axios";
import { writeFileSync } from "fs";

import dotenv from "dotenv";
dotenv.config();

const appId = process.env.RAKUTEN_APP_ID;
if (!appId) {
    throw new Error("RAKUTEN_APP_ID が設定されていません");
}

async function generateCategoryMap() {
    try {
        const res = await axios.get(
            "https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426",
            {
                params: { applicationId: appId, format: "json" },
            }
        );

        // 大カテゴリ・中カテゴリ・小カテゴリの配列を取得
        const { large = [], medium = [], small = [] } = res.data.result;

        // 中カテゴリを{ "1010": { categoryId: "1010", categoryName: "和食", ... } }のような形式に加工
        const mediumMap = Object.fromEntries(medium.map((m) => [m.categoryId, m]));
        // 大カテゴリ辞書{ "1010": { categoryId: "1010", categoryName: "和食", ... } }のような形式に加工
        const largeMap = Object.fromEntries(large.map((l) => [l.categoryId, l]));

        // 大-中-小 の形式のカテゴリIDを作り、categoryMap に「小カテゴリ名 → fullId」として格納
        const categoryMap = {};

        small.forEach((s) => {
            const mid = mediumMap[s.parentCategoryId];
            if (!mid) return;
            const largeCat = largeMap[mid.parentCategoryId];
            if (!largeCat) return;

            const fullId = `${largeCat.categoryId}-${mid.categoryId}-${s.categoryId}`;
            categoryMap[s.categoryName] = fullId;
        });

        // JSONファイルとして保存
        writeFileSync(
            "./src/categoryMap.json",
            JSON.stringify(categoryMap, null, 2),
            "utf-8"
        );

        console.log(
            "src/categoryMap.json を生成しました！ 件数:",
            Object.keys(categoryMap).length
        );
    } catch (e) {
        console.error("カテゴリ取得エラー:", e.message);
    }
}

generateCategoryMap();
