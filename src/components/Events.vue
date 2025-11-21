<script setup lang="ts" vapor>
import { ref } from "vue";

const count = ref(1);
function add() {
  count.value = count.value + 1;
}

function add100() {
  count.value = count.value + 100;
}

function sub() {
  count.value = count.value - 1;
}

const mergeEvents = {
  click: add100,
  mousemove: sub,
};
</script>

<template>
  <div class="div-parent" @click="add100">
    <div>count = {{ count }}</div>
    <button @click="add">自增</button>
    <div>
      <button @click.stop="add">自增,阻止冒泡</button>
    </div>
    <div>
      <button @click="add" @click.left="add">自增 绑定多个事件</button>
    </div>
    <div>
      <button @focus="add">激活时,非冒泡事件</button>
    </div>

    <div>
      <button v-on="mergeEvents">聚合事件， 点击+100， 滑动--</button>
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
