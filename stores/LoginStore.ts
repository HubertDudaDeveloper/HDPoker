import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { Stores } from '@/types/PokerTypes'

export interface LoginState {
    isLoading: boolean;
    isError: boolean;
    isAuthorised: boolean;
}

export const useLoginStore = defineStore(Stores.LOGIN_STORE, () => {

    const state: Ref<LoginState> = ref({
        isLoading: false,
        isError: false,
        isAuthorised: false,
    })


    return {
        state,
    }
});