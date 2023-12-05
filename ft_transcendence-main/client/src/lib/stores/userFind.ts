import { writable } from 'svelte/store';

const userFind = writable({ user: null, loading: true });

export default userFind;
