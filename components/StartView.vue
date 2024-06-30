<template>
    <div class="wrapper">
        <div class="data-container">
            <label for="room">
                Wpisz nazwę pokoju
            </label>
            <input id="room" v-model="room" placeholder="Poker room"/>
            <label for="user">
                Wpisz swoją nazwę
            </label>
            <input id="user" v-model="userName" placeholder="Jan Kowalski"/>
            <label for="password">
                Hasło pokoju (opcjonalne)
            </label>
            <input id="password" v-model="password" type="password" placeholder="Super tajne hasło"/>
        </div>

        <div v-if="status">
            {{ status }}
        </div>
        
        <div class="action-wrapper">
            <button @click="handleJoinRoom">Dołącz do pokoju</button>
            <button @click="handleCreateRoom">Utwórz pokój</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import MessageType from '@/pages/index.vue'

const emits = defineEmits(['createRoom', 'joinRoom']);
const room = ref('');
const userName = ref('');
const password = ref('');

const status = ref('')

const handleJoinRoom = async () => {
    const roomInfo = await $fetch('https://ogarniamdiete.pl:8443/room-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'join', room: { name: room.value, password: password.value } })
    })

    if (JSON.parse(roomInfo).response) {
        emits('joinRoom', { room: room.value, password: password.value }, { id: '1', name: userName.value, points: 0 })
        console.log('Joining room')
    } else {
        status.value = JSON.parse(roomInfo).message
    }

}

const handleCreateRoom = async () => {
    const roomInfo = await $fetch('https://ogarniamdiete.pl:8443/room-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'init', room: { name: room.value, password: password.value } })
    })

    console.log(JSON.parse(roomInfo))

    if (JSON.parse(roomInfo).response) {
        emits('createRoom', { name: room.value, password: password.value }, { id: '1', name: userName.value, points: 0 })
        console.log('Creating room')
    } else {
        status.value = JSON.parse(roomInfo).message
    }
}

</script>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: center;
    min-height: 100vh;
    gap: 20px;
}

.data-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: center;
}

.action-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-self: center;
    gap: 20px;
}

label {
    margin: 10px 0;
}
</style>