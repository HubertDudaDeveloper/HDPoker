<template>
  <div>
    <p
      class="server"
      :class="{ alive: pokerState.isAlive, dead: !pokerState.isAlive }"
    >
      Server: {{ pokerState.isAlive ? "Active" : "Inactive" }}
    </p>
    <template v-if="!isLoading">
      <StartView v-if="!loginState.isAuthorised" />
      <RoomView v-else />
    </template>

    <div class="loader" v-else>
      <img src="/assets/loader.gif" alt="loader" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useUsersStore } from "@/stores/UsersStore";
import { useRoomStore } from "@/stores/RoomStore";
import { usePokerStore } from "@/stores/PokerStore";
import { useLoginStore } from "@/stores/LoginStore";
import { MessageType, type extWebSocket } from "@/types/PokerTypes";

const pokerStore = usePokerStore();
const { state: pokerState } = storeToRefs(pokerStore);

const usersStore = useUsersStore();
const { state: usersState } = storeToRefs(usersStore);

const roomStore = useRoomStore();
const { state: roomState } = storeToRefs(roomStore);

const loginStore = useLoginStore();
const { state: loginState } = storeToRefs(loginStore);

const isLoading = ref(true);
let ws: extWebSocket;
let pingInterval: ReturnType<typeof setInterval>;

const parseJsonSafely = (data: string) => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const handleWSMessage = (event: MessageEvent) => {
  const data = parseJsonSafely(event.data);
  if (!data) return;

  switch (data.type) {
    case MessageType.INIT:
      roomStore.handleJoinAfterCreateRoom(data);
      break;
    case MessageType.JOIN:
      roomStore.handleJoinAfterJoinRoom(data);
      break;
    case MessageType.UPDATE:
      roomStore.handleUpdateRoom(data);
      break;
    case MessageType.LEAVE:
      roomStore.handleLeaveRoom();
      break;
    case MessageType.ERROR:
      if (data.code === 404) {
        roomStore.handleLeaveRoom();
      }
      break;
    default:
      break;
  }
};

const connectToWSS = async () => {
  return new Promise<void>((resolve, reject) => {
    try {
      ws = new WebSocket("ws://localhost:3001") as extWebSocket;

      ws.onopen = () => {
        pokerState.value.isAlive = true;

        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("pong");
            pokerState.value.isAlive = true;
          } else {
            pokerState.value.isAlive = false;
          }
        }, 5000);

        resolve();
      };

      ws.onmessage = (event) => {
        if (event.data === "ping") {
          ws.send("pong");
          return;
        }
        if (event.data === "pong") return;
        handleWSMessage(event);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        reject(err);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        clearInterval(pingInterval);
      };

      pokerState.value.ws = ws;
    } catch (error) {
      reject(error);
    }
  });
};

onMounted(async () => {
  try {
    usersState.value.me = JSON.parse(localStorage.getItem("user") ?? "{}");

    const savedRoom = JSON.parse(localStorage.getItem("room") ?? "{}");
    const isSavedRoom = Boolean(Object.keys(savedRoom).length);

    await connectToWSS();

    if (isSavedRoom) {
      roomState.value.room = savedRoom;
      setTimeout(() => {
        roomStore.handleJoinRoom(savedRoom, usersState.value.me, ws);
      }, 1500);
    }
  } catch (err) {
    console.error("WebSocket Init Error:", err);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  ws?.close();
  clearInterval(pingInterval);
});
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
