import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Favorites from './views/Favorites.vue';
import Login from './views/Login.vue';

const routes = [
    { path: '/', component: Home, props: true },
    { path: '/favorites', component: Favorites },
    { path: '/login', component: Login }
];

const router = createRouter({
    history: createWebHistory('/app/recipe-search/'),
    routes,
});

export default router;

