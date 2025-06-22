import { defineStore, storeToRefs } from "pinia";
import { ref, type Ref } from "vue";
import { useUsersStore } from "@/stores/UsersStore";
import { useTasksStore } from "@/stores/TasksStore";
import { useLoginStore } from "@/stores/LoginStore";
import { usePokerStore } from "@/stores/PokerStore";
import { MessageType, Stores } from "@/types/PokerTypes";
import type { User, Room } from "@/types/PokerTypes";

interface RoomState {
  isLoading: boolean;
  isError: boolean;
  room: Room;
}

export const useRoomStore = defineStore(Stores.ROOM_STORE, () => {
  const state: Ref<RoomState> = ref({
    isLoading: false,
    isError: false,
    room: {
      id: "",
      name: "",
      points: "",
      users: [],
      revealed: false,
      tasks: "",
      votes: [],
      messages: [],
    },
  });

  const { state: usersState } = storeToRefs(useUsersStore());

  const { state: tasksState } = storeToRefs(useTasksStore());

  const { state: loginState } = storeToRefs(useLoginStore());

  const { state: pokerState } = storeToRefs(usePokerStore());

  const handleJoinAfterCreateRoom = (data: Record<string, Room & User>) => {
    const users =
      typeof data.room.users === "string"
        ? JSON.parse(data.room.users)
        : data.room.users;
    const user = data.user;
    const tasks =
      typeof data.room.tasks === "string"
        ? JSON.parse(data.room.tasks)
        : data.room.tasks;
    const room = { ...data.room, users, tasks };

    state.value.room = room;
    usersState.value.me = user;

    tasksState.value.tasks = tasks;
    usersState.value.users = users;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("room", JSON.stringify(room));

    loginState.value.isAuthorised = true;
  };

  const handleJoinAfterJoinRoom = (data: Record<string, Room & User>) => {
    const users =
      typeof data.room.users === "string"
        ? JSON.parse(data.room.users)
        : data.room.users;
    const user = data.user;
    const tasks =
      typeof data.room.tasks === "string"
        ? JSON.parse(data.room.tasks)
        : data.room.tasks;
    const room = { ...data.room, users, tasks };

    state.value.room = room;
    usersState.value.me = user;

    tasksState.value.tasks = tasks;
    usersState.value.users = users;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("room", JSON.stringify(room));
    loginState.value.isAuthorised = true;
  };

  const handleUpdateRoom = (data: Record<string, Room & User>) => {
    console.log(data)
    const users =
      typeof data.room.users === "string"
        ? JSON.parse(data.room.users)
        : data.room.users;
    const tasks =
      typeof data.room.tasks === "string"
        ? JSON.parse(data.room.tasks)
        : data.room.tasks;
    const room = { ...data.room, users, tasks };

    usersState.value.users = users;
    state.value.room = room;

    tasksState.value.tasks = tasks;
  };

  const handleJoinRoom = async (room: Room, user: User, ws: WebSocket) => {
    const payload = {
      type: MessageType.JOIN,
      room: room,
      user: user,
    };

    ws.send(JSON.stringify(payload));
    loginState.value.isAuthorised = true;
  };

  const handleCreateRoom = (room: Room, user: User, ws: WebSocket) => {
    const payload = {
      type: MessageType.INIT,
      room: room,
      user: user,
    };

    ws.send(JSON.stringify(payload));
  };

  const handleLeaveRoom = () => {
    loginState.value.isAuthorised = false;
    state.value.room = {} as unknown as Room;
    usersState.value.users = [];
    localStorage.removeItem("room");
  };

  return {
    state,
    handleJoinAfterCreateRoom,
    handleJoinAfterJoinRoom,
    handleUpdateRoom,
    handleJoinRoom,
    handleCreateRoom,
    handleLeaveRoom,
  };
});
