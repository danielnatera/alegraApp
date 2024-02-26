<template>
  <div class="modal-background d-flex" v-if="invoiceData">
    <div
      class="invoice-container modal-content d-flex flex-column justify-content-center align-items-center"
    >
      <div class="invoice-border w-100">
        <h2>Factura #{{ invoiceData.id }}</h2>
        <h2>Imágenes del mundo</h2>
        <div class="divisor w-100"></div>
        <p><strong>Vendedor:</strong> {{ invoiceData.seller.name }}</p>
        <p><strong>Fecha:</strong> {{ invoiceData.date }}</p>
        <p><strong>Fecha de Vencimiento:</strong> {{ invoiceData.dueDate }}</p>
        <p><strong>Cliente:</strong> {{ invoiceData.client.name }}</p>
        <p>
          <strong>ID del Cliente:</strong>
          {{ invoiceData.client.identification }}
        </p>

        <h4>Items</h4>
        <ul>
          <li v-for="item in invoiceData.items" :key="item.id">
            {{ item.quantity }} x {{ item.name }} a {{ item.price }} cada uno.
            Total: {{ item.total }}
          </li>
        </ul>

        <p><strong>Total:</strong> {{ invoiceData.total }}</p>
        <p><strong>Total Pagado:</strong> {{ invoiceData.totalPaid }}</p>
        <p><strong>Estado:</strong> {{ invoiceData.status }}</p>
        <div class="w-100 justify-content-center d-flex">
          <button @click="finish">Terminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImagesInvoice",
  props: {
    invoiceData: Object,
  },

  methods: {
    finish() {
      this.$emit("finish");
    },
  },
};
</script>

<style>
.invoice-border {
  border: dotted 2px rgb(61, 184, 149) !important;
  padding: 12px;
}

.invoice-container {
  width: 450px !important;
}

.invoice-container p,
.invoice-container h4 {
  width: 100%;
}

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
}

.modal-content {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff5ea !important;
}

.divisor {
  background-color: rgb(61, 184, 149);
  height: 4px;
  margin-bottom: 12px;
}
</style>
