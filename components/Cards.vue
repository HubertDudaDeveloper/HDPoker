<template>
    <textarea v-if="false" placeholder="Punkty" class="glass"/>
        <div class="cards">
            <span v-for="(card, index) in cardState.cards" class="card glass" @click="() => handleClick(card)">
                {{ card }}
            </span>
        </div>
        <div class="summary">
            <template v-if="roomState.room.revealed">
                Średnia punktów: <strong>{{ cardStore.summary }}</strong>
            </template>
            <template v-else>
                Średnia punktów: ?
            </template>
        </div>
</template>
<script setup lang="ts">
import { useCardsStore } from '@/stores/CardsStore'
import { useRoomStore } from '@/stores/RoomStore'
import { useUsersStore } from '@/stores/UsersStore'
import { usePokerStore } from '@/stores/PokerStore'
import { storeToRefs } from 'pinia'
import type { User } from '@/types/PokerTypes'

const cardStore = useCardsStore()
const { state: cardState } = storeToRefs(cardStore)

const pokerStore = usePokerStore()
const { state: pokerState } = storeToRefs(pokerStore)

const usersStore = useUsersStore()
const { state: usersState } = storeToRefs(usersStore)

const roomStore = useRoomStore()
const { state: roomState } = storeToRefs(roomStore)

const points: Ref<string | number> = ref('')

const handleClick = (card: number | string | undefined) => {
    if (!card) {
        return;
    }

    points.value = card;

    const fUser = usersState.value.users.find((item: User)=> item.id === usersState.value.me.id) as User
    fUser.points = card;

    pokerState.value.ws!.send(`${JSON.stringify({ type: 'vote', user: fUser, room: roomState.value.room})}`)
}

</script>