<template>
    <div class="container">
        <div class="room-column">
            <h1>Poker</h1>
            
            <p class="room">
                Pokój: <strong>{{ roomState.room.name }}</strong> <i class="bi-journal" @click="handleChangeRoom"/>
            </p>

            <div v-if="isChangeingRoom" class="edit-cards">
                <div class="form-wrapper">
                    Edytuj karty:
                    <textarea type="text" v-model="cards" />
                    <button @click="handleEditCards">Zapisz</button>
                </div>
            </div>
            
            <Cards/>
            
            <Tasks/>
            
        </div> 
        <div class="users-column">
        <div class="action-container">
            <button class="btn" @click="handleShow">Odkryj</button>
            <button class="btn" @click="handleReset">Resetuj</button>
            <button class="btn" @click="handleFinish">Zakończ</button>
            <button class="btn" @click="handleLeave">Wyjdź z pokoju</button>
        </div>

        <h2>Gracze:</h2>
        <Users/>
        
    </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/TasksStore'
import { useCardsStore } from '@/stores/CardsStore'
import { useRoomStore } from '@/stores/RoomStore'
import { useUsersStore } from '@/stores/UsersStore'
import { usePokerStore } from '@/stores/PokerStore'
import type { Task } from '@/types/PokerTypes'

const { summary } = storeToRefs(useCardsStore())
const { state: tasksState, activeTasks, finishedTasks } = storeToRefs(useTasksStore())

const roomStore = useRoomStore()
const { state: roomState } = storeToRefs(roomStore)

const pokerStore = usePokerStore()
const { state: pokerState } = storeToRefs(pokerStore)

const usersStore = useUsersStore()
const { state: usersState } = storeToRefs(usersStore)

const isChangeingRoom: Ref<boolean> = ref(false)

const cards: Ref<string> = ref('')

const handleEditCards = () => {
    pokerState.value.ws!.send(`${JSON.stringify({ type: 'update', user: usersState.value.me, room: {...roomState.value.room, cards: cards.value.split(' ') }})}`)
    isChangeingRoom.value = false
}

const handleShow = async () => {
    await pokerState.value.ws!.send(`${JSON.stringify({ type: 'reveal', user: usersState.value.me, room: roomState.value.room })}`);
    
    if (roomState.value.room.revealed) {
        return;
    }

    const fTasks = typeof tasksState.value.tasks === 'object' ? tasksState.value.tasks.filter((t: Task) => t.status === 'active') : []
 
    if (fTasks.length) {
        fTasks.reverse()[0].points = summary.value;
    }
    await pokerState.value.ws!.send(`${JSON.stringify({ type: 'task', user: usersState.value.me, room: {...roomState.value.room, tasks: fTasks.reverse() }, })}`);
}

const handleReset = async () => {
    await pokerState.value.ws!.send(`${JSON.stringify({ type: 'reset', user: usersState.value.me, room: roomState.value.room })}`);
}

const handleLeave = async () => {
    await pokerState.value.ws!.send(`${JSON.stringify({ type: 'leave', user: usersState.value.me, room: roomState.value.room })}`);
}

const handleFinish = async () => {
    const oldTasks = tasksState.value.tasks
    const newTask = { ...activeTasks.value.reverse().pop(), status: 'finished' }
    
    const filteredTasks = oldTasks.filter((t: Task) => t.id !== newTask.id) as Task[]

    const tasksToSend = filteredTasks.length ? filteredTasks : oldTasks

    await pokerState.value.ws!.send(`${JSON.stringify(
        {
            type: 'task', user: usersState.value.me,
            room: {...roomState.value.room, tasks: [...tasksToSend, newTask]},
        }
    )}`)
}

const handleChangeRoom = () => {
    isChangeingRoom.value = !isChangeingRoom.value
    cards.value = roomState.value.room.cards!.toString()
}

onBeforeUnmount(async () => {
    await pokerState.value.ws!.send(`${JSON.stringify({ type: 'leave', user: usersState.value.me, room: roomState.value.room })}`)
})

</script>

<style lang="scss">
$card-width: 133px;

h1 {
    margin-bottom: 20px;
}

.room {
    margin-bottom: 48px;
}

.container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    height: 100vh;
    max-width: 1366px;
    gap: 48px;
}

.room-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: white;
}

.users-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100vh;
    color: white;

    @media screen and (min-width: 756px) {
        justify-content: center;
    }

    .action-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 20px;
        width: 100%;

        .btn {
            width: calc(50% - 2px);
            padding: 10px;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            margin: 0;
            transition-duration: 0.25s;

            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
        }
    }

    h2 {
        border-radius: 16px 16px 0 0;
        border: 1px solid white;
        width: 100%;
        padding: 20px;
    }

    .users {
        display: flex;
        flex-direction: column;
        width: 100%;

        .user {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 10%;
            width: 100%;
            padding: 20px;
            border: 1px solid white;
            border-radius: 4px;
            min-width: 200px;

            .user-image {
                border-radius: 50%;
                margin-right: 10px;            
            }
        }
    }
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
    border-radius: 10px;
    cursor: pointer;
    min-width: $card-width;
    transition-duration: 0.25s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.tasks {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid white;
    border-radius: 4px;
    max-height: 600px;
    overflow-y: auto;

    .tabs-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        border-bottom: 1px solid white;

        .tab {
            width: 50%;
            cursor: pointer;
            text-align: center;
            min-height: 50px;
            padding: 20px;
            border-radius: 0px;
            transition-duration: 0.25s;
        }

        .tab:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
    }

    .tasks-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid white;
    }

    .task {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        width: 100%;
        border-bottom: 1px dashed white;
        border-radius: 0;
    }
}

.summary {
    padding: 20px;
}

.button {
    padding: 10px;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition-duration: 0.25s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.new-task {
    height: 50px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center; 
    
    * {
        border-radius: 4px;
        color: white;
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid white;
        transition-duration: 0.25s;
        height: 100%;
        border-radius: 0;
        backdrop-filter: none;
    }

    *:not(:last-child) {
        width: 50%;
    }

    *:last-child {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        cursor: pointer;
        width: 50px;
        height: 100%;
        font-size: 30px;
    }
}

.edit-cards {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    .form-wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.19);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(8.6px);
        -webkit-backdrop-filter: blur(8.6px);
        border: 1px solid rgba(255, 255, 255, 1);
        
        textarea {
            min-width: 300px;
            min-height: 200px;
        }
    }

    &::before {
        display: flex;
        justify-content: center;
        align-self: center;
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
    }
}
</style>