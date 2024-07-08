<template>
    <div class="container">
        <div class="room-column">
        <h1>Poker</h1>
        <p class="room">Pokój: <strong>{{ props.room.name }}</strong> <i class="bi-journal" @click="handleChangeRoom"/></p>
        <textarea v-if="false" v-model="cards" placeholder="Punkty" class="glass"/>
        <div class="cards">
            <span v-for="(card, index) in cards" class="card glass" @click="() => handleClick(card)">
                {{ card }}
            </span>
        </div>
        <div class="summary">
            <template v-if="props.room.revealed">
                Średnia punktów: <strong>{{ summary }}</strong>
            </template>
            <template v-else>
                Średnia punktów: ?
            </template>
        </div>
        <div class="tasks">
            <div class="tasks-header">
                <h2>Zadania</h2>
                <button class="button" @click="handleAddTask">Dodaj nowe</button>
            </div>
            <div class="tabs-wrapper">
                <div class="tab" :class="{ 'glass': tasksTab === 'active' }" @click="handleTab">
                    Aktywne
                </div>
                <div class="tab" :class="{ 'glass': tasksTab === 'finished' }" @click="handleTab">
                    Zakończone
                </div>
            </div>
            <div class="new-task" v-if="isNewTask && tasksTab === 'active'">
                <input v-model="newTask.name" placeholder="Nazwa zadania"/>
                <input v-model="newTask.link" placeholder="Link do zadania"/>
                <button @click="handleSendNewTask" class="bi-plus"/>
            </div>
            <div v-for="(task, index) in tasks" class="task glass" :key="task">
                <p>{{ task.name }}</p>
                <a :href="task.link">{{ task.link }}</a>
                <p>{{ task.points }}</p>
            </div>
        </div> 
    </div>
    <div class="users-column">
        <div class="action-container">
            <button class="btn" @click="handleShow">Odkryj</button>
            <button class="btn" @click="handleReset">Resetuj</button>
            <button class="btn" @click="handleFinish">Zakończ</button>
            <button class="btn" @click="handleLeave">Wyjdź z pokoju</button>
        </div>
        <h2>Gracze:</h2>
        <div class="users">
            <p v-for="(user, index) in users" class="user glass" :key="`${user.name} ${index}`">
                <img class="user-image" :src="userImage(user)" height="50" width="50"/>
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
import { ref, computed } from 'vue'
import type { Room, User, Task } from '@/pages/index.vue'

const props = defineProps(['users', 'room', 'me', 'ws'])

const points: Ref<string | number> = ref('')

const isChangeingRoom: Ref<boolean> = ref(false)

const activeTasks = computed(() => {
    if (!props.room?.tasks) {
        return []
    }
    
    const tasks = JSON.parse(typeof JSON.parse(props.room.tasks) === 'string' ? JSON.parse(props.room.tasks) : props.room.tasks)
    return tasks.filter((t: Task) => t.status === 'active').reverse()
});

const finishedTasks = computed(() => {
    if (!props.room?.tasks) {
        return []
    }
    const tasks = JSON.parse(typeof JSON.parse(props.room.tasks) === 'string' ? JSON.parse(props.room.tasks) : props.room.tasks)
    return tasks.filter((t: Task) => t.status === 'finished').reverse()
});

const tasks = computed(() => tasksTab.value === 'active' ? activeTasks.value : finishedTasks.value)

const isNewTask = ref(false)

const tasksTab = ref('active')

const handleTab = () => {
    const newValue = tasksTab.value === 'active' ? 'finished' : 'active'
    tasksTab.value = newValue
}

const newTask: Ref<Task> = ref({
    id: '',
    name: '',
    link: '',
    points: 0,
    status: 'active'
})

const summary = computed(() => {
    const points = props.users.map((user: any) => user.points).filter((point: any) => typeof point === 'number') as number[];
    const sum = points.reduce((acc, point) => acc + point, 0);
    const votedUsers = props.users.filter((user: any) => typeof user.points === 'number').length;
    return votedUsers ? sum / votedUsers : 'Brak głosów';
});

const cards = ref([2, 3, 5, 8, 13, 21, 34, 55, 89, '?']);

const userImage = (user: User) => {
    return typeof user.image === 'string' && user.image ? user.image : 'https://www.gravatar.com/avatar/?d=mp'
}

const handleShow = async () => {
    await props.ws.send(`${JSON.stringify({ type: 'reveal', user: props.me, room: props.room })}`);
    
    if (props.room.revealed) {
        return;
    }

    const fTasks = typeof JSON.parse(props.room.tasks) === 'string'
        ? JSON.parse(JSON.parse(props.room.tasks)).filter((t: Task) => t.status === 'active')
        : JSON.parse(props.room.tasks).filter((t: Task) => t.status === 'active')
 
    if (fTasks.length) {
        fTasks.reverse()[0].points = summary.value;
    }
    await props.ws.send(`${JSON.stringify({ type: 'task', user: props.me, room: {...props.room, tasks: fTasks.reverse() }, })}`);
}

const handleReset = async () => {
    await props.ws.send(`${JSON.stringify({ type: 'reset', user: props.me, room: props.room })}`);
}

const handleLeave = async () => {
    await props.ws.send(`${JSON.stringify({ type: 'leave', user: props.me, room: props.room })}`);
}

const handleFinish = async () => {
    const oldTasks = typeof JSON.parse(props.room.tasks) === 'string' ? JSON.parse(JSON.parse(props.room.tasks)) : JSON.parse(props.room.tasks)
    const newTask = { ...activeTasks.value.reverse().pop(), status: 'finished' }
    await props.ws.send(`${JSON.stringify(
        {
            type: 'task', user: props.me,
            room: {...props.room, tasks: [...oldTasks.filter((t: Task) => t.id !== newTask.id), newTask]},
        }
    )}`)
}

const handleAddTask = async () => {
    tasksTab.value = 'active'
    isNewTask.value = true
}

const handleChangeRoom = () => {
    isChangeingRoom.value = !isChangeingRoom.value
}

const handleSendNewTask = async () => {
    newTask.value.id = (JSON.parse(props.room.tasks).length + 1).toString();
    newTask.value.status = 'active'

    const oldTasks = typeof JSON.parse(props.room.tasks) === 'string' ? JSON.parse(JSON.parse(props.room.tasks)) : JSON.parse(props.room.tasks)

    await props.ws.send(`${JSON.stringify({ type: 'task', user: props.me, room: {...props.room, tasks: [...oldTasks, newTask.value]}, })}`);
    isNewTask.value = false;
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

onBeforeUnmount(async () => {
    await props.ws.send(`${JSON.stringify({ type: 'leave', user: props.me, room: props.room })}`)
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
    height: 100vh;
    max-width: 1366px;
    width: 100%;
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
    justify-content: center;
    height: 100vh;
    color: white;

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
</style>