<template>
    <div>
        <p class="server" :class="{ 'alive': isAlive, 'dead': !isAlive }">
            Server: {{ isAlive ? 'Aktywny' : 'Rozłączony' }}
        </p>
        <template v-if="!isLoading">
            <StartView v-if="!isAuthorised" @createRoom="handleCreateRoom" @joinRoom="handleJoinRoom"/>
            <RoomView v-else :users="users" :room="room" :me="me" :ws="ws"/>
        </template>

        <div class="loader" v-else>
            <img src="/assets/loader.gif" alt="loader"/>
        </div>
    </div>
</template>

<script setup lang="ts">
const isAuthorised = ref(false);

const isAlive = ref(true);

const isJsonString = (str: string) => {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

interface extWebSocket extends WebSocket {
    me: User;
    room: Room;
}

let ws: extWebSocket

enum MessageType {
    INIT = 'init', //stwórz pokój
    VOTE = 'vote', //zagłosuj w pokoju
    RESET = 'reset', //zresetuj głosy w pokoju
    JOIN = 'join', //dołącz do pokoju
    LEAVE = 'leave', //opuść pokój
    MESSAGE = 'message', //wyslij wiadomość w pokoju
    TASK = 'task', // ustaw/usuń/edytuj task w pokoju
    REVEAL = 'reveal', // odkryj głosy w pokoju
    UPDATE = 'update', // zaktualizuj pokój
    ERROR = 'error', // zaktualizuj pokój
}

export interface User {
    id: string;
    name: string;
    image: string;
    points: number | string;
}

export interface Room {
    id: string;
    name: string;
    points: number | string;
    password: string;
    users: User[];
    revealed: boolean;
    tasks: string;
    votes: [];
    messages: [];
}

export interface Task {
    id: string;
    name: string;
    link: string;
    points: number;
    status: string;
}

const users: Ref<User[]> = ref([])

const room: Ref<Room | any> = ref({})

const me: Ref<User | any> = ref({})

const isLoading = ref(true)

const handleCreateRoom = (room: Room, user: User) => {

    const payload = {
        type: MessageType.INIT,
        room: room,
        user: user,
    }

    ws.send(JSON.stringify(payload))
}

const handleJoinAfterCreateRoom = (data: Record<string, Room & User>) => {
    users.value = JSON.parse(data.room.users as unknown as string)
    room.value = {...data.room, users: JSON.parse(data.room.users as unknown as string)}
    me.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('room', JSON.stringify({...data.room, users: JSON.parse(data.room.users as unknown as string)}))
    isAuthorised.value = true
}

const handleJoinAfterJoinRoom = (data: Record<string, Room & User>) => {
    users.value = JSON.parse(data.room.users as unknown as string)
    room.value = {...data.room, users: JSON.parse(data.room.users as unknown as string)}
    me.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('room', JSON.stringify({...data.room, users: JSON.parse(data.room.users as unknown as string)}))
    isAuthorised.value = true
}

const handleUpdateRoom = (data: Record<string, Room & User>) => {
    users.value = JSON.parse(data.room.users as unknown as string)
    room.value = {...data.room, users: JSON.parse(data.room.users as unknown as string)}
}

const handleJoinRoom = async (room: Room, user: User) => {

    const payload = {
        type: MessageType.JOIN,
        room: room,
        user: user,
    }

    ws.send(JSON.stringify(payload))
    isAuthorised.value = true
}

const handleLeaveRoom = () => {
    isAuthorised.value = false
    room.value = {}
    users.value = []
    localStorage.removeItem('room')
}

const connectToWSS = async () => {

    try {

        ws = new WebSocket('wss://ogarniamdiete.pl:8443') as extWebSocket;

        ws.onopen = (event) => {
            console.log('WebSocket connection established')
            setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send('pong');
                    isAlive.value = true;
                } else {
                    isAlive.value = false;
                }
            }, 5000); // Changed interval to 1 second
        };

        ws.onmessage = (event) => {

            switch (event.data) {
                case 'ping':
                    ws.send('pong');
                    break;
                case 'pong':
                    console.log('Received pong');
                    break;
                default:
                    if (!isJsonString(event.data)) {
                        return;
                    }
                    const data = JSON.parse(event.data)
                    data.type === MessageType.INIT && handleJoinAfterCreateRoom(data);
                    data.type === MessageType.JOIN && handleJoinAfterJoinRoom(data);
                    data.type === MessageType.UPDATE && handleUpdateRoom(data);
                    data.type === MessageType.LEAVE && handleLeaveRoom();
                    data.type === MessageType.ERROR && data.code === 404 && handleLeaveRoom();
            }
        }

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    } catch (err) {
        console.error(err)
    }
}

onMounted(async () => {

    me.value = JSON.parse(localStorage.getItem('user') ?? '{}')

    const savedRoom = JSON.parse(localStorage.getItem('room') ?? '{}')

    const isSavedRoom = Boolean(Object.values(savedRoom).length)

    try {
        await connectToWSS()   
        if (isSavedRoom) {
            room.value = savedRoom        
            setTimeout(() => handleJoinRoom(savedRoom, me.value), 500)
        }   
    } catch (err) {
        console.error(err)
    } finally {
        isLoading.value = false
    }
}) 

</script>

<style lang="scss">
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
    background: rgba(255, 255, 255, 0.19);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8.6px);
    -webkit-backdrop-filter: blur(8.6px);
    border: 1px solid rgba(255, 255, 255, 1);
}

input::placeholder {
    color: rgba(255, 255, 255, 0.773);
}

button {
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
    color: white;
    background: rgba(255, 255, 255, 0.19);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8.6px);
    -webkit-backdrop-filter: blur(8.6px);
    border: 1px solid rgba(255, 255, 255, 1);
}

</style>
