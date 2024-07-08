import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { MessageType, Stores } from '@/types/PokerTypes'
import { useRoomStore } from '@/stores/RoomStore'
import type { extWebSocket } from '@/types/PokerTypes'

interface PokerState {
    isLoading: boolean;
    isError: boolean;
    isAlive: boolean;
    messages: [];
    ws: extWebSocket | null;
}

export const usePokerStore = defineStore(Stores.POKER_STORE, () => {

    const state: Ref<PokerState> = ref({
        isLoading: false,
        isError: false,
        isAlive: false,
        messages: [],
        ws: null,
    })

    const roomStore = useRoomStore()

    const isJsonString = (str: string) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
      }
    
    return {
        state,
        isJsonString
    }
});