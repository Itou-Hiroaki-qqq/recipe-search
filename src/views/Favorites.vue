<script>
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default {
    data() {
        return {
            favorites: [],
        };
    },
    async mounted() {
        await this.loadFavorites();
    },
    methods: {
        async loadFavorites() {
            const querySnapshot = await getDocs(collection(db, "favorites"));
            this.favorites = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        async removeFavorite(id) {
            try {
                await deleteDoc(doc(db, "favorites", id));
                this.favorites = this.favorites.filter(fav => fav.id !== id);
                alert("お気に入りを解除しました。");
            } catch (error) {
                console.error("削除エラー:", error);
                alert("お気に入り解除に失敗しました。");
            }
        }
    }
};
</script>

<template>
    <div class="max-w-4xl mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6">お気に入りリスト</h1>

        <div v-if="favorites.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="item in favorites" :key="item.id" class="border rounded-lg p-4 hover:shadow-md">
                <a :href="item.url" target="_blank">
                    <img :src="item.image_url" :alt="item.title" class="w-full h-48 object-cover rounded" />
                    <h2 class="text-lg font-semibold mt-2">{{ item.title }}</h2>
                    <p class="text-sm text-gray-600">{{ item.description }}</p>
                </a>
                <button @click="removeFavorite(item.id)"
                    class="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    お気に入りを解除する
                </button>
            </div>
        </div>

        <div v-else class="text-center text-gray-500">お気に入りが登録されていません。</div>
    </div>
</template>

<style>
body {
    font-family: "Noto Sans JP", sans-serif;
}
</style>