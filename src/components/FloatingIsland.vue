<script setup>
import { ref } from 'vue'
import { useLoop } from '@tresjs/core'

// 获取渲染循环钩子
const { onBeforeRender } = useLoop()

// 岛屿浮动偏移量
const islandFloatOffset = ref({ y: 0, rotation: 0 })

// 浮动动画 - 只上下浮动，不旋转
onBeforeRender(({ elapsed }) => {
  islandFloatOffset.value.y = Math.sin(elapsed * 0.5) * 0.08
  islandFloatOffset.value.rotation = 0 // 不旋转，避免视觉问题
})
</script>

<template>
  <TresGroup
    :position="[0, islandFloatOffset.y, 0]"
    :rotation="[0, islandFloatOffset.rotation, 0]"
  >
    <!-- 🏝️ 岛屿主体 - 一体化圆台 -->
    <TresMesh :position="[0, 0, 0]">
      <TresCylinderGeometry :args="[2.8, 3.5, 1.2, 12]" />
      <TresMeshStandardMaterial color="#4a9c5a" />
    </TresMesh>

    <!-- 🌲 中央大树 - 树干 -->
    <TresMesh :position="[0, 0.9, 0]">
      <TresCylinderGeometry :args="[0.08, 0.12, 0.5, 6]" />
      <TresMeshStandardMaterial color="#5d4037" />
    </TresMesh>

    <!-- 🌳 树冠 - 多层球形 -->
    <TresMesh :position="[0, 1.4, 0]">
      <TresConeGeometry :args="[0.4, 0.7, 6]" />
      <TresMeshStandardMaterial color="#2d5a2d" />
    </TresMesh>
    <TresMesh :position="[0, 1.7, 0]">
      <TresConeGeometry :args="[0.3, 0.5, 6]" />
      <TresMeshStandardMaterial color="#3d8b3d" />
    </TresMesh>

    <!-- 🏝️ 岛屿底部 - 倒锥形岩石 -->
    <TresMesh :position="[0, -1.4, 0]">
      <TresConeGeometry :args="[3.2, 1.8, 8]" />
      <TresMeshStandardMaterial color="#8b7355" />
    </TresMesh>

    <!-- 💧 水面 - 半透明圆盘 -->
    <TresMesh :position="[0, -0.6, 0]">
      <TresCylinderGeometry :args="[4, 4, 0.02, 32]" />
      <TresMeshStandardMaterial
        color="#4fc3f7"
        :transparent="true"
        :opacity="0.3"
      />
    </TresMesh>
  </TresGroup>
</template>
