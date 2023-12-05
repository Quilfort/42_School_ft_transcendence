import { writable } from "svelte/store";

export const publicChannelStore = writable({ data: [], loading: true });

export const channelStore = writable({ data: [], loading: true});

export const singleChannelStore = writable({ data: [{ messages: [] }], gotoChat: false, loading: true });

export const mutedUserInChannel = writable({ data: [], loading: true });

export const mutedUsers = writable({ data: [], loading: true });