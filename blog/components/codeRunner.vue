<template>
  <ClientOnly>
    <Teleport to="body">
      <button id="runner-btn" @click="runCode">Run copy code</button>
    </Teleport>
  </ClientOnly>
</template>
<script setup lang="ts">
import { onMounted } from "vue";

async function runCode() {
  const code = await window.navigator.clipboard.readText();
  if (code) {
    const blob = new Blob([code], { type: "text/javascript" });
    const blobURL = URL.createObjectURL(blob);
    await import(blobURL);
    URL.revokeObjectURL(blobURL);
    // const scriptDom = document.createElement("script");
    // scriptDom.type = "module";
    // scriptDom.innerHTML = code;
    // document.body.appendChild(scriptDom);
  }
}
function loadImportmap() {
  if (!window.__loadImportmap) {
    const scriptDom = document.createElement("script");
    scriptDom.type = "importmap";
    scriptDom.innerHTML = `{
      "imports": {
        "vue": "https://unpkg.com/vue@3.6.0-alpha.3/dist/vue.runtime-with-vapor.esm-browser.js"
      }
    }`;

    document.head.append(scriptDom);
    window.__loadImportmap = true;
  }
}
onMounted(() => {
  loadImportmap();
});
</script>

<style lang="css">
#runner-btn {
  position: fixed;
  top: 80px;
  right: 20px;

  border: 1px solid #ccc;
}
</style>
