<template>
    <div class="container">
        <div class="room-column">
        <h1>Poker</h1>
        <p class="room">Pokój: {{ props.room.name }}</p>
        <div class="cards">
            <span v-for="(card, index) in cards" class="card" @click="() => handleClick(card)">
                {{ card }}
            </span>
        </div>
        <template v-if="props.room.revealed">
            {{ summary }}
        </template> 
    </div>
    <div class="people-column">
        <h2>Gracze</h2>
        <button class="show-btn" @click="handleShow">Odkryj</button>
        <button class="show-btn" @click="handleReset">Resetuj</button>
        <div class="people">
            <p v-for="(user, index) in users" :key="`${user.name} ${index}`">
                {{ user.name }}: 
                <template v-if="user.points">
                    <template v-if="props.room.revealed">
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
import type { Room, User } from '@/pages/index.vue';
import MessageType from '@/pages/index.vue';

const props = defineProps(['users', 'room', 'me', 'ws']);

const points: Ref<string | number> = ref('');

const summary = computed(() => {
    const points = props.users.map((user: any) => user.points).filter((point: any) => typeof point === 'number') as number[];
    const sum = points.reduce((acc, point) => acc + point, 0);
    const votedUsers = props.users.filter((user: any) => typeof user.points === 'number').length;
    return votedUsers ? sum / votedUsers : 'Brak głosów';
});

const cards = ref([2, 3, 5, 8, 13, 21, 34, 55, 89, '?']);

const handleShow = async () => {
    await props.ws.send(`${JSON.stringify({ type: 'reveal',user: props.me, room: props.room })}`);
}

const handleReset = async () => {
    await props.ws.send(`${JSON.stringify({ type: 'reset', user: props.me, room: props.room })}`);
}

const handleClick = (card: number | string | undefined) => {
    if (!card) {
        return;
    }

    points.value = card;

    const fUser = props.users.find((item: User)=> item.id === props.me.id)
    fUser.points = card;

    props.ws.send(`${JSON.stringify({ type: 'vote', user: fUser, room: props.room})}`)
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