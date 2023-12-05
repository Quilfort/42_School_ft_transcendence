import { writable } from "svelte/store";


export const gameQueue = writable({ data: {}, loading: true });

// res.field
export const gameField = writable({ data: [], loading: true });
// res.game
export const gameState = writable({ data: [], loading: true });
// res.players
export const gamePlayers = writable({ data: [], loading: true });
// res.score
export const gameScore = writable({ data: [], loading: true });
