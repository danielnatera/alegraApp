<template>
  <transition name="fade">
    <div v-if="visible" class="success-message">
      <h6 class="mb-0">Seleccionado con éxito</h6>
    </div>
  </transition>
</template>

<script>
export default {
  props: ["visible"],
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.success-message {
  display: flex;
  align-items: center;
  position: fixed;
  top: 120px;
  left: 20px;
  height: 40px;
  padding: 0px 10px;
  background-color: hwb(148 24% 5%);
  border-radius: 12px;
  color: #fff5ea;
  box-shadow: 0px 16px 24px 0px rgba(123, 97, 255, 0.15);
}
</style>
