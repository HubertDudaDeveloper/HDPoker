import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { Stores } from "@/types/PokerTypes";
import type { Task } from "@/types/PokerTypes";

export interface TaskState {
  isLoading: boolean;
  isError: boolean;
  tasks: Task[];
  newTask: Task;
}

export const useTasksStore = defineStore(Stores.TASKS_STORE, () => {
  const state: Ref<TaskState> = ref({
    isLoading: false,
    isError: false,
    tasks: [],
    newTask: {
      id: "",
      name: "",
      image: "",
      points: "",
      link: "",
      status: "",
    },
  });

  const activeTasks = computed(() => {
    const tasks =
      typeof state.value.tasks === "string"
        ? JSON.parse(state.value.tasks)
        : state.value.tasks;

    if (!tasks || !tasks.length) return [];

    return tasks.filter((t: Task) => t.status === "active").reverse();
  });

  const finishedTasks = computed(() => {
    const tasks =
      typeof state.value.tasks === "string"
        ? JSON.parse(state.value.tasks)
        : state.value.tasks;

    if (!tasks || !tasks.length) return [];

    return tasks.filter((t: Task) => t.status === "finished").reverse();
  });

  return {
    state,
    activeTasks,
    finishedTasks,
  };
});
