<template>
    <div>
        <StartView v-if="!isAuthorised" @createRoom="handleCreateRoom()" @joinRoom="handleCreateRoom()"/>
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

let ws: WebSocket;

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
    points: number | string;
}

const handleCreateRoom = (room: Record<string, string>, user: User) => {
    isAuthorised.value = true;

    const payload = {
        type: MessageType.INIT,
        room: room,
        user: user,
    }

    ws.send(JSON.stringify(payload))
}

const me = ref<User>({id: '1', name: '', points: ''})

const users = ref<User[]>([])

const handleJoinRoom = () => {
    isAuthorised.value = true;
}

onMounted(() => {
    ws = new WebSocket('wss://ogarniamdiete.pl:8443');

    ws.onopen = (event) => {
        console.log('WebSocket connection established')
        me.value.id = event.data;
        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send('pong');
            }
        }, 5000); // Changed interval to 1 second
    };

    ws.onmessage = (event) => {
        if (event.data === 'ping') {
            ws.send('pong');
        } else if (event.data === 'pong') {
            console.log('Received pong');
        } else {
            if (!isJsonString(event.data)) {
                return;
            }
            const data = JSON.parse(event.data)
            data.type === MessageType.INIT && handleJoinRoom();
        }
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}) 

</script>
