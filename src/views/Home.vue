<script setup>
import { ref, onMounted } from 'vue';
// 楽天APIからの情報取得に使用。fetchより扱いやすいと知り採用。
import axios from 'axios';
// レシピ情報のカテゴリー数が膨大なためjsonファイルで切り出し
import categoryMap from '../categoryMap.json';

import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from 'firebase/auth';

// currentUser を受け取る
const props = defineProps({
    currentUser: { type: Object, default: null }
});

const ingredient = ref('');
const recipes = ref([]);
const loading = ref(false);
const error = ref(null);

// 楽天APIのID
const appId = import.meta.env.VITE_RAKUTEN_APP_ID;

// カタカナはすべてひらがなに変換
function toHiragana(str) {
    return str.replace(/[\u30a1-\u30f6]/g, match =>
        String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
}

// レシピ検索の関数本体
const onSearch = async () => {
    const ingRaw = ingredient.value.trim();
    if (!ingRaw) {
        error.value = '食材を入力してください';
        return;
    }

    // 入力はひらがなに変換
    const ing = toHiragana(ingRaw);

    // 検索語が登録カテゴリーと部分的に一致しても検索
    const key = Object.keys(categoryMap).find(k => {
        const normalizedKey = toHiragana(k);
        return normalizedKey.includes(ing);
    });

    const categoryId = key ? categoryMap[key] : null;

    if (!categoryId) {
        error.value = `カテゴリIDが登録されていない食材です: ${ingRaw}`;
        return;
    }

    loading.value = true;
    error.value = null;
    recipes.value = [];

    try {
        // 楽天レシピAPIから該当カテゴリのレシピランキングを取得
        const rankRes = await axios.get(
            'https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426',
            {
                params: {
                    applicationId: appId,
                    categoryId: categoryId,
                    format: 'json'
                }
            }
        );

        const ranking = rankRes.data.result;

        if (!ranking || ranking.length === 0) {
            error.value = 'ランキングデータが存在しません';
            return;
        }

        const keyword = '簡単';

        // 「簡単」を含むレシピを優先的に抽出
        const easyRecipes = ranking.filter(r =>
            (r.recipeTitle && r.recipeTitle.includes(keyword)) ||
            (r.recipeDescription && r.recipeDescription.includes(keyword))
        );

        // 「簡単」が含まれないレシピの抽出
        const others = ranking.filter(r => !easyRecipes.includes(r));

        // 「簡単」を含むレシピを優先して抽出、残りは「簡単」以外から抽出
        const merged = [...easyRecipes, ...others];

        // 上位10件を表示
        recipes.value = merged.slice(0, 10);
    } catch (e) {
        console.error('検索時エラー:', e);
        error.value = 'レシピの取得に失敗しました';
    } finally {
        loading.value = false;
    }
};

// お気に入り登録ボタン
const addToFavorites = async (recipe) => {
    if (!props.currentUser) {
        alert("お気に入り登録にはログインが必要です。");
        return;
    }

    try {
        await addDoc(collection(db, "favorites"), {
            userId: props.currentUser.uid,
            title: recipe.recipeTitle,
            image_url: recipe.foodImageUrl,
            url: recipe.recipeUrl,
            description: recipe.recipeDescription
        });
        alert("お気に入りに追加しました！");
    } catch (error) {
        console.error("お気に入り登録エラー:", error);
        alert("お気に入り登録に失敗しました。");
    }
};

</script>

<template>
    <div class="max-w-4xl mx-auto p-4">
        <div class="flex gap-2 mb-6">
            <input v-model="ingredient" @keyup.enter="onSearch" class="flex-1 border border-gray-300 rounded px-3 py-2"
                placeholder="食材を入力" />
            <button @click="onSearch" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">検索</button>
        </div>

        <div v-if="loading" class="text-center text-gray-600">読み込み中...</div>
        <div v-if="error" class="text-red-500">{{ error }}</div>

        <div v-if="recipes.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="recipe in recipes" :key="recipe.recipeId" class="border rounded-lg p-4 hover:shadow-md">
                <a :href="recipe.recipeUrl" target="_blank">
                    <img :src="recipe.foodImageUrl" :alt="recipe.recipeTitle"
                        class="w-full h-48 object-cover rounded" />
                    <h2 class="text-lg font-semibold mt-2">{{ recipe.recipeTitle }}</h2>
                    <p class="text-sm text-gray-600">{{ recipe.recipeDescription }}</p>
                </a>
                <button @click="addToFavorites(recipe)"
                    class="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                    お気に入りに追加
                </button>
            </div>
        </div>

        <div v-if="recipes.length" class="mt-6 text-right">
            <a :href="`https://recipe.rakuten.co.jp/search/${encodeURIComponent(ingredient + ' 簡単')}/`"
                class="text-blue-600 underline" target="_blank">もっと検索する</a>
        </div>
    </div>
</template>

<style>
body {
    font-family: "Noto Sans JP", sans-serif;
}
</style>