<template>
  <Head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  </Head>
  <NuxtPage/>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Bebas+Neue&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
$font-primary: "Poppins", sans-serif;

$font-secondary: "Anton SC", sans-serif;

$font-third: "Bebas Neue", cursive;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: $font-primary;
}

body {
  font-family: 'Roboto', sans-serif;
  background-image: radial-gradient( circle farthest-corner at 10% 20%,  rgba(37,145,251,0.98) 0.1%, rgba(0,7,128,1) 99.8% );
  color: white;
  display: flex;
  justify-content: center;
}

h1 {
  font: 64px $font-third;
}

.glass {
  background: rgba(255, 255, 255, 0.19);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 1);
}

</style>