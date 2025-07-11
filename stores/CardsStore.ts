import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { useUsersStore } from "@/stores/UsersStore";

export enum CARDS_STORE {
  NAME = "CardsStore",
}

export interface CardsState {
  isLoading: boolean;
  isError: boolean;
  cards: (string | number)[];
}

export const useCardsStore = defineStore(CARDS_STORE.NAME, () => {
  const state: Ref<CardsState> = ref({
    isLoading: false,
    isError: false,
    cards: [2, 3, 5, 8, 13, 21, 34, 55, 89, "?"],
  });

  const { state: usersState } = storeToRefs(useUsersStore());

  const summary = computed(() => {
    const points = usersState.value.users
      .map((user: any) => parseFloat(user.points))
      .filter((point: number) => !isNaN(point)); // odfiltrowuje NaN po parseFloat

    const sum = points.reduce((acc, point) => acc + point, 0);
    const votedUsers = points.length;

    return votedUsers ? (sum / votedUsers).toFixed(2) : "No votes";
  });

  return {
    state,
    summary,
  };
});
