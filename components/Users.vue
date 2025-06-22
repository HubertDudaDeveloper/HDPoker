<template>
  <div class="users">
    <p
      v-for="(user, index) in userState.users.sort((a, b) =>
        a.name.localeCompare(b.name)
      )"
      class="user glass"
      :key="`${user.name} ${index}`"
    >
      <img class="user-image" :src="userImage(user)" height="50" width="50" />
      {{ user.name }}:
      <template v-if="Number(user.points)">
        <template v-if="roomState.room.revealed">
          {{ user.points }}
        </template>
        <template v-else> Ready </template>
      </template>
      <template v-else> Not Ready </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { User } from "@/types/PokerTypes";
import { useUsersStore } from "@/stores/UsersStore";
import { useRoomStore } from "@/stores/RoomStore";
import { storeToRefs } from "pinia";

const usersStore = storeToRefs(useUsersStore());
const { state: roomState } = storeToRefs(useRoomStore());

const { state: userState } = usersStore;

const userImage = (user: User) => {
  return typeof user.image === "string" && user.image
    ? user.image
    : "https://www.gravatar.com/avatar/?d=mp";
};
</script>
