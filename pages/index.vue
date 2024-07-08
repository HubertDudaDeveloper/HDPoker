<template>
    <div>
        <p class="server" :class="{ 'alive': pokerState.isAlive, 'dead': !pokerState.isAlive }">
            Server: {{ pokerState.isAlive ? 'Aktywny' : 'Rozłączony' }}
        </p>
        <template v-if="!isLoading">
            <StartView v-if="!loginState.isAuthorised"/>
            <RoomView v-else/>
        </template>

        <div class="loader" v-else>
            <img src="/assets/loader.gif" alt="loader"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/UsersStore'
import { useRoomStore } from '@/stores/RoomStore'
import { usePokerStore } from '@/stores/PokerStore'
import { useLoginStore } from '@/stores/LoginStore'
import type { extWebSocket } from '@/types/PokerTypes'
import { MessageType } from '@/types/PokerTypes'

const pokerStore = usePokerStore()
const { state: pokerState } = storeToRefs(pokerStore)

const usersStore = useUsersStore()
const { state: usersState } = storeToRefs(usersStore)

const roomStore = useRoomStore()
const { state: roomState } = storeToRefs(roomStore)

const loginStore = useLoginStore()
const { state: loginState } = storeToRefs(loginStore)

let ws: extWebSocket

const isLoading = ref(true)

const connectToWSS = async () => {

    try {

        ws = new WebSocket('wss://ogarniamdiete.pl:8443') as extWebSocket;

        ws.onopen = (event) => {
            console.log('WebSocket connection established')
            setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send('pong');
                    pokerState.value.isAlive = true;
                } else {
                    pokerState.value.isAlive = false;
                }
            }, 5000)
        }

        ws.onmessage = (event) => {

            switch (event.data) {
                case 'ping':
                    ws.send('pong');
                    break;
                case 'pong':
                    console.log('Received pong');
                    break;
                default:
                    if (!pokerStore.isJsonString(event.data)) {
                        return;
                    }
                    const data = JSON.parse(event.data)
                    data.type === MessageType.INIT && roomStore.handleJoinAfterCreateRoom(data);
                    data.type === MessageType.JOIN && roomStore.handleJoinAfterJoinRoom(data);
                    data.type === MessageType.UPDATE && roomStore.handleUpdateRoom(data);
                    data.type === MessageType.LEAVE && roomStore.handleLeaveRoom();
                    data.type === MessageType.ERROR && data.code === 404 && roomStore.handleLeaveRoom();
            }
        }

        ws.onclose = () => {
            console.log('WebSocket connection closed')
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
    } catch (err) {
        console.error(err)
    } finally {
        pokerState.value.ws = ws
        isLoading.value = false
    }
}


onMounted(async () => {
    isLoading.value = true
    usersState.value.me = JSON.parse(localStorage.getItem('user') ?? '{}')

    const savedRoom = JSON.parse(localStorage.getItem('room') ?? '{}')
    const isSavedRoom = Boolean(Object.values(savedRoom).length)

    try {
        await connectToWSS()   
        if (isSavedRoom) {
            roomState.value.room = savedRoom        
            setTimeout(() => roomStore.handleJoinRoom(savedRoom, usersState.value.me, ws), 1500)
        }   
    } catch (err) {
        console.error(err)
    } finally {
        isLoading.value = false
    }
}) 

</script>

<style lang="scss">
@mixin glass() {
    background: rgba(255, 255, 255, 0.19);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8.6px);
    -webkit-backdrop-filter: blur(8.6px);
    border: 1px solid rgba(255, 255, 255, 1);
}

.server {
    display: flex;
    width: 100%;
    justify-content: center;
    padding: 10px;
    color: white;
}

.loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;

    img {
        border-radius: 25%;
        width: 100px;
        height: 100px;
    }
}

input {
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
    color: white;
    cursor: pointer;
    @include glass;
}

input::placeholder {
    color: rgba(255, 255, 255, 0.773);
}

button {
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
    color: white;
    cursor: pointer;
    @include glass;
}

</style>
