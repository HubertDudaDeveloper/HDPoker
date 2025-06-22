<template>
    <div class="wrapper">
        <form class="data-container">
            <img class="user-image" :src="userImage" height="100px" width="100px"/>
            <label for="room">
                Enter room name
            </label>
            <input id="room" v-model="room" placeholder="Room name..."/>
            <label for="user">
                Enter your name
            </label>
            <input id="user" autocomplete="username" v-model="userName" placeholder="User name..."/>
            <label for="image">
                Add an image!
            </label>
            <input id="image" type="file" @change="handleImageChange" accept="image/png, image/gif, image/jpeg"/>
            <label for="password">
                Room password (optional)
            </label>
            <input id="password" autocomplete="current-password" v-model="password" type="password" placeholder="Secret..."/>
        </form>

        <div v-if="status">
            {{ status }}
        </div>
        
        <div class="action-wrapper">
            <button @click="handleJoinRoom">Join the room</button>
            <button @click="handleCreateRoom">Create a room</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { User, Room } from '@/types/PokerTypes'
import { useRoomStore } from '@/stores/RoomStore'
import { usePokerStore } from '@/stores/PokerStore'
import { storeToRefs } from 'pinia'

const room = ref('')
const userName = ref('')
const password = ref('')
const userImage = ref('https://www.gravatar.com/avatar/?d=mp')

const roomStore = useRoomStore()

const pokerStore = usePokerStore()
const { state: pokerState } = storeToRefs(pokerStore)

const status = ref('')

const getUser = (): User => {
    const savedUser = JSON.parse(localStorage.getItem('user') ?? '{}')
    savedUser.name = userName.value
    const isSavedUser = Boolean(Object.values(savedUser).length)

    return isSavedUser ? savedUser : { id: 'init', name: userName.value, points: 0, image: '' }
}

const handleImageChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    const isMaxsize = file?.size! > 2000000

    file?.size && isMaxsize ? alert('Plik jest za duży! Max 2mb') : null

    if (file && !isMaxsize) {
        const reader = new FileReader()
        reader.onload = (e) => {
            userImage.value = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const checkRoom = async (type: string) => {
    const roomInfo: string = await $fetch('http://localhost:3001/room-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: type, room: { name: room.value, password: password.value } })
    })
    return roomInfo
}

const handleJoinRoom = async () => {
    const roomInfo = await checkRoom('join')
    
    if (JSON.parse(roomInfo).response) {
        const roomData = { name: room.value, password: password.value } as unknown as Room

        roomStore.handleJoinRoom(roomData, {...getUser(), image: userImage.value}, pokerState.value.ws!)
        console.log('Joining room')
    } else {
        status.value = JSON.parse(roomInfo).message
    }

}

const handleCreateRoom = async () => {
    const roomInfo = await checkRoom('init')

    console.log(JSON.parse(roomInfo))

    if (JSON.parse(roomInfo).response) {
        const roomData = { name: room.value, password: password.value } as unknown as Room
        
        roomStore.handleCreateRoom(roomData, {...getUser(), image: userImage.value}, pokerState.value.ws!)
        console.log('Creating room')
    } else {
        status.value = JSON.parse(roomInfo).message
    }
}

</script>

<style scoped lang="scss">
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

.user-image {
    border-radius: 50%;
    margin: 10px 0;
    align-self: center;
}
</style>