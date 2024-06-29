<template>
    <div class="wrapper">
        <div class="data-container">
            <label for="room">
                Wpisz nazwę pokoju
            </label>
            <input id="room" v-model="room" placeholder="Poker room"/>
            <label for="user">
                Wpisz swoją nazwę
            </label>
            <input id="user" v-model="userName" placeholder="Jan Kowalski"/>
            <label for="password">
                Hasło pokoju (opcjonalne)
            </label>
            <input id="password" v-model="password" type="password" placeholder="Super tajne hasło"/>
        </div>
        
        <div class="action-wrapper">
            <button>Dołącz do pokoju</button>
            <button>Utwórz pokój</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';

const room = ref('');
const userName = ref('');
const password = ref('');

</script>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: center;
    min-height: 100vh;
    gap: 20px;
}

.data-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: center;
}

.action-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-self: center;
    gap: 20px;
}

label {
    margin: 10px 0;
}
</style>