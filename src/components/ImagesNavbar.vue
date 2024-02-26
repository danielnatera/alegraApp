<template>
  <nav class="navbar">
    <div class="d-flex">
      <img
        src="@/assets/alegra_ico.svg"
        width="40px"
        height="40px"
        class="alegra-ico"
      />
      <h1 class="navbar-brand">Imágenes del mundo</h1>
    </div>
  </nav>
</template>

<script>
export default {
  name: "ImagesNavbar",
};
</script>

<style>
.navbar {
  background-color: rgb(0, 177, 157);
  color: white;
  padding: 10px 20px;
}

.navbar-brand {
  font-size: 24px !important;
  margin-left: 20px;
  color: white !important;
  font-weight: 800;
}

.alegra-ico {
  margin-left: 80px;
}
</style>
