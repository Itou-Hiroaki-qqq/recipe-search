<script setup>
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
    try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push('/');
    } catch (e) {
        error.value = 'ログインに失敗しました。';
        console.error(e);
    }
};
</script>

<template>
    <div class="max-w-md mx-auto p-4">
        <h1 class="text-xl font-bold mb-4">ログイン</h1>
        <input v-model="email" placeholder="メールアドレス" class="border p-2 w-full mb-2" />
        <input v-model="password" type="password" placeholder="パスワード" class="border p-2 w-full mb-2" />
        <button @click="login" class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
            ログイン
        </button>
        <p class="text-red-500 mt-2">{{ error }}</p>

        <!-- テスト用アカウント情報 -->
        <div class="mt-6 text-sm text-gray-500">
            <p class="font-semibold mb-1">テスト用アカウント：</p>
            <p>メールアドレス：111@test.com</p>
            <p>パスワード：111test</p>
        </div>
    </div>
</template>