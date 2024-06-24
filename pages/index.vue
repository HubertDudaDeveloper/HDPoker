<template>
    <div class="container">
        <div class="room-column">
        <h1>Poker</h1>
        <p class="room">Pokój: <input v-model="room"/></p>
        <div class="cards">
            <span v-for="(card, index) in cards" class="card" @click="() => handleClick(card)">
                {{ card }}
            </span>
        </div>
        <template v-if="show">
            {{ summary }}
        </template> 
    </div>
    <div class="people-column">
        <h2>Gracze</h2>
        <button class="show-btn" @click="show = !show">Odkryj</button>
        <div class="people">
            <p v-for="(user, index) in usersCollection" :key="`${user.name} ${index}`">
                {{ user.name }}: 
                <template v-if="user.points">
                    <template v-if="show">
                        {{ user.points }}
                    </template>
                    <template v-else>
                        Gotowy
                    </template>
                </template>
            </p>
        </div>
    </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePokerStore } from '@/service/PokerService';
import { useWebSocket } from '@vueuse/core'

export interface User {
    id: string;
    name: string;
    points: number | string;
}
const { status, data, send, open, close } = useWebSocket('wss://ogarniamdiete.pl:8443', {

    heartbeat: true,
});

watch(data, (newValue) => {
    console.log(newValue);
})

const pokerStore = usePokerStore();

const me = ref<User>({name: 'Jan', id: '1', points: 0});

const show = ref(false);

const room = '';

const { state: pokerState } = storeToRefs(pokerStore)


const summary = computed(() => {
    const points = usersCollection.value.map(user => user.points).filter(point => typeof point === 'number') as number[];
    const sum = points.reduce((acc, point) => acc + point, 0);
    return sum;
});

const usersCollection: Ref<User[]> = ref(pokerState.value.users as unknown as User[]);

const cards = ref([2, 3, 5, 8, 13, 21, 34, 55, 89, '?']);

const handleClick = (card: number | string | undefined) => {
    if (!card) {
        return;
    }

    me.value.points = card;
    open()
    send(`${JSON.stringify(me.value)}`);

    me.value.points = card;
    const meUser = usersCollection.value.find(user => user.id === me.value.id);
    meUser && (meUser.points = card);
}
</script>

<style lang="scss">
$card-width: 133px;

h1 {
    margin-bottom: 20px;
    font: 64px 'Roboto', sans-serif;
}

.room {
    margin-bottom: 48px;
}

.container {
    display: flex;
    flex-direction: row;
    height: 100vh;
    max-width: 1366px;
    width: 100%;
}

.room-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: hsl(226, 59%, 10%);
    color: white;
}

.people-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: hsl(226, 59%, 10%);
    color: white;
}

.cards {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    width: calc($card-width * 5 + 40px);
}

.card {
    padding: 20px;
    background-color: hsl(226, 59%, 20%);
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid white;
    min-width: $card-width;
}

</style>