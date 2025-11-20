<script setup lang="ts" vapor>
import { ref } from "vue";

const count = ref(1);
function add() {
  count.value = count.value + 1;
}

function parentAdd() {
  count.value = count.value + 100;
}
</script>

<template>
  <div class="div-parent" @click="parentAdd">
    <div>count = {{ count }}</div>
    <button @click="add">自增</button>
    <div>
      <button @click.stop="add">自增,阻止冒泡</button>
    </div>
    <div>
      <button @click="add" @click.left="add">自增 绑定多个事件</button>
    </div>
  </div>
</template>

<style scoped>
.div-parent {
  padding: 50px;
}

button {
  margin: 20px;
}
</style>
