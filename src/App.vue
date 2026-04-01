<script setup>
// 使用 Vue Router 管理路由
</script>

<template>
  <router-view />
</template>

<style>
/* 清除浏览器默认的内外边距，防止出现滚动条 */
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
