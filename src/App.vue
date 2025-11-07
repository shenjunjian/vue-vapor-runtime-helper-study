<script setup lang="ts" vapor>
import HelloWorld from "./components/HelloWorld.vue";

import { template, child, nthChild, next, txt } from "vue";
const node = template(
  "<h1><div>第一个节点</div><div>第二个节点</div>    <div>第四个节点</div><!--注释节点--></h1>"
)();

const n1 = child(node);
const n2 = nthChild(node, 1);
const n3 = nthChild(node, 2); // 空格为 text 类型的node
const n4 = nthChild(node, 3);
const comment = next(n4);

console.log({ node, n1, n2, n3, n4, comment });
</script>

<template>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped></style>
