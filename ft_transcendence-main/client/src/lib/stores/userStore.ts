import { writable } from 'svelte/store';

export const userStore = writable({ user: null, loading: true });
export const blockedUsers = writable({ blockedUsers: [], loading: true, blocked: false });
export const friendUsers = writable({ friendUsers: [], loading: true, friends: false });