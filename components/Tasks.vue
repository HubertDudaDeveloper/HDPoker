<template>
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
        <div v-for="(task, index) in tasks" class="task glass" :key="`${task.name} ${index}`">
            <p>{{ task.name }}</p>
            <a :href="task.link">{{ task.link }}</a>
            <p>{{ task.points }}</p>
        </div>
    </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/TasksStore'
import { usePokerStore } from '@/stores/PokerStore'
import { useUsersStore } from '@/stores/UsersStore'
import { useRoomStore } from '@/stores/RoomStore'
import type { Task } from '@/types/PokerTypes'

const isNewTask = ref(false)
const tasksTab = ref('active')

const taskStore = useTasksStore()
const { state: taskState, activeTasks, finishedTasks } = storeToRefs(taskStore)

const pokerStore = usePokerStore()
const { state: pokerState } = storeToRefs(pokerStore)

const usersStore = useUsersStore()
const { state: usersState } = storeToRefs(usersStore)

const roomStore = useRoomStore()
const { state: roomState } = storeToRefs(roomStore)

const newTask: Ref<Task> = ref(taskState.value.newTask)

const tasks = computed(() => tasksTab.value === 'active' ? activeTasks.value : finishedTasks.value)

const handleSendNewTask = async () => {

    const taskIds = taskState.value.tasks.map((t: Task) => t.id) as unknown as number[]
    let maxId = taskIds.length ? Math.max(...taskIds) : 0

    if (maxId === -Infinity) {
        maxId = 0
    }

    newTask.value.id = (maxId + 1).toString()
    newTask.value.status = 'active'
    console.log(newTask.value.id)
    const oldTasks = taskState.value.tasks

    await pokerState.value.ws!.send(`${JSON.stringify({ type: 'task', user: usersState.value.me, room: {...roomState.value.room, tasks: [...oldTasks, newTask.value]}, })}`);
    newTask.value = { id: '', name: '', link: '', points: 0, status: 'active' }
    isNewTask.value = false
}

const handleTab = () => {
    const newValue = tasksTab.value === 'active' ? 'finished' : 'active'
    tasksTab.value = newValue
}

const handleAddTask = async () => {
    tasksTab.value = 'active'
    isNewTask.value = true
}



</script>