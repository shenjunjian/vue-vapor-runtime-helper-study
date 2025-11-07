<script setup lang="ts" vapor>
import { ref } from "vue";

defineProps<{ msg: string }>();

const clsA = ref("cls-a");
const clsB = ref(true);

const style = ref({ background: "red" });

const domId = ref("someId");
const inputValue = ref("hello");
const list = ref([
  { id: 1, name: "张三" },
  { id: 2, name: "李四" },
]);

function toggle() {
  clsB.value = !clsB.value;
}
</script>

<template>
  <h1>
    <div>纯静态节点</div>
  </h1>

  <h1>
    <div id="bind-text">绑定 文本 值 {{ msg }}</div>
    <div id="bind-text">绑定 文本 值 {{ msg }}</div>
  </h1>

  <div>
    <div :class="[clsA, { 'cls-b': clsB }]" :style="style">
      绑定class, style
    </div>
  </div>

  <div>
    <div :id="domId">绑定dom属性</div>
  </div>

  <div>
    <div @click="toggle">绑定事件</div>
  </div>

  <input type="text" v-model="inputValue" />

  <ul>
    <li v-for="li in list" :data-id="li.id">
      无 key {{ li.name }}<span>{{ li.name }}</span>
    </li>
  </ul>

  <ul>
    <li v-for="li in list" :data-id="li.id">有 key{{ li.name }}</li>
  </ul>
</template>

<style scoped></style>
