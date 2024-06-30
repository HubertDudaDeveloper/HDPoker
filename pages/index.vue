<template>
    <div>
        <StartView v-if="!isAuthorised" @createRoom="handleCreateRoom" @joinRoom="handleJoinRoom()"/>
        <RoomView v-else :ws="ws"/>
    </div>
</template>

<script setup lang="ts">
const isAuthorised = ref(false);

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


const handleCreateRoom = (room: Room, user: User) => {

    const payload = {
        type: MessageType.INIT,
        room: room,
        user: user,
    }

    ws.send(JSON.stringify(payload))
}

const users = ref<User[]>([])

const handleJoinRoom = (data: Record<string, Room & User>) => {
    ws.me = data.user
    ws.room = {...data.room, users: JSON.parse(data.room.users as unknown as string)}
    isAuthorised.value = true
}

onMounted(() => {
    ws = new WebSocket('wss://ogarniamdiete.pl:8443') as extWebSocket;

    ws.onopen = (event) => {
        console.log('WebSocket connection established')
        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send('pong');
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
                data.type === MessageType.INIT && handleJoinRoom(data);
        }
    }

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}) 

</script>
