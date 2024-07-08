import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { Stores } from '@/types/PokerTypes' 
import type { User } from '@/types/PokerTypes' 


export interface UsersState {
    isLoading: boolean;
    users: User[];
    me: User;
}

export const useUsersStore = defineStore(Stores.USERS_STORE, () => {

    const state: Ref<UsersState> = ref({
        isLoading: false,
        users: [],
        me: {
            id: '',
            name: '',
            image: '',
            points: '',
        }
    })


    return {
        state,
    }
});