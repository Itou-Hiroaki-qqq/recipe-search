<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const router = useRouter();
const route = useRoute();
const currentUser = ref(null);
const ready = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    ready.value = true;
  });
});

const logout = async () => {
  await signOut(auth);
  router.push('/');
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <header class="flex justify-between items-start px-4 mb-6 mt-8 w-full">
      <h1 class="text-2xl font-bold">簡単レシピ検索</h1>

      <div class="flex flex-col items-end gap-3">
        <div
          class="flex gap-3 
                transform scale-110 text-base
                sm:scale-90 sm:text-xs
                [@media(max-width:400px)]:scale-75 [@media(max-width:400px)]:text-[10px]"
        >
          <template v-if="route.path === '/favorites'">
            <router-link
              to="/"
              class="bg-gray-500 text-white px-5 py-3 rounded hover:bg-gray-600 whitespace-nowrap"
            >
              トップページに戻る
            </router-link>
          </template>
          <template v-else>
            <template v-if="currentUser">
              <button
                @click="logout"
                class="bg-red-500 text-white px-5 py-3 rounded hover:bg-red-600 whitespace-nowrap"
              >
                ログアウト
              </button>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="bg-indigo-500 text-white px-5 py-3 rounded hover:bg-indigo-600 whitespace-nowrap"
              >
                ログイン
              </router-link>
            </template>
          </template>
        </div>

        <div v-if="route.path !== '/favorites'">
          <router-link
            to="/favorites"
            class="text-blue-600 underline text-lg whitespace-nowrap"
          >
            お気に入りリスト
          </router-link>
        </div>
      </div>
    </header>

    <main class="px-4">
      <router-view v-if="ready" :current-user="currentUser" />
    </main>

    <footer class="text-center mt-10 text-sm text-gray-500">
      All Rights Reserved 2025 ©︎ Hiroaki Ito
    </footer>
  </div>
</template>
