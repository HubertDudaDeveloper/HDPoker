<template>
  <p class="user glass">
    <img class="user-image" :src="userImage(user)" height="50" width="50" />
    {{ user.name }}:
    <template v-if="Number(user.points)">
      <template v-if="room.revealed">
        {{ user.points }}
      </template>
      <template v-else> Ready </template>
    </template>
    <template v-else> Not Ready </template>
  </p>
</template>

<script setup lang="ts">
import type { User, Room } from "@/types/PokerTypes";

export interface IProps {
  user: User,
  room: Room
}

const props = defineProps<IProps>()


const userImage = (user: User) => {
  return typeof user.image === "string" && user.image
    ? user.image
    : "https://www.gravatar.com/avatar/?d=mp";
};
</script>
