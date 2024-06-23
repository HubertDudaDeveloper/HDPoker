import { defineStore, storeToRefs } from 'pinia';
import PokerRepository from '@/repo/PokerRepository';

export enum POKER {
    NAME = 'HDPoker',
}

export const usePokerStore = defineStore(POKER.NAME, () => {
    
    const { createRoom: repoCreateRoom, joinRoom: repoJoinRoom } = PokerRepository();
    
    const fState = {
        roomName: '',
        users: [] as Record<string, number | string>[],
        cards: [] as string[] | number[],
        avarege: 0,
    }

    const createRoom = (roomName: string, user: Record<string, number | string>) => {
        repoCreateRoom(roomName, user);
        fState.roomName = roomName;
        fState.users.push(user);
    }

    const joinRoom = (roomName: string, user: Record<string, number | string>) => {
        const room = repoJoinRoom(roomName, user);
        if (!room) {
            return;
        }
        fState.roomName = room.name;
        fState.users = [ ...room.roomContent.users ];
    }

    const state = ref(fState);

    return {
        state,
        createRoom,
        joinRoom,
    }
});