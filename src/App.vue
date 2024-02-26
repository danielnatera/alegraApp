<template>
  <div>
    <ImagesNavbar />
    <SuccessMessage :visible="showMessage" />
    <main class="main d-flex justify-content-center align-items-center">
      <div class="search-container d-flex align-items-center flex-column">
        <h1 class="title">Busca las <span>mejores</span> imágenes</h1>
        <h4>¡Ingresa una palabra y escoge tu imagen favorita!</h4>
        <p class="infoText">
          Una vez selecciones tu imagen favorita haz una nueva búsqueda
        </p>
        <div class="position-relative">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="fetchImages"
            placeholder="Ingresa una palabra"
          />
          <img
            src="@/assets/lens.svg"
            width="24px"
            height="24px"
            class="lens-icon"
          />
        </div>
        <button class="search-btn mt-3" @click="fetchImages">Buscar</button>
      </div>
      <div class="images-container">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="image-container d-flex flex-column"
          @click="chooseImage(index)"
          :class="{
            selected: selectedImageIndex === index,
            disabled: buttonsDisabled,
          }"
        >
          <div
            class="scoreTag d-flex justify-content-center align-items-center"
          >
            {{ sellers[index].points }}/20
          </div>
          <img
            :src="image.link"
            :alt="image.title"
            class="result-image object-fit-cover"
            @error="imageOnError"
          />
          <div class="info-container d-flex align-items-center py-2">
            <div class="px-1 bill-ico-container">
              <img
                src="@/assets/bills_ico.svg"
                width="40px"
                height="40px"
                class="bill-ico"
              />
            </div>
            <h6 class="mb-0">{{ sellers[index].name }}</h6>
          </div>
        </div>
      </div>
    </main>
    <ImagesInvoice
      v-if="fullInvoice"
      :invoiceData="fullInvoice"
      @finish="finish"
    />
    <div
      v-if="loading"
      class="overlay d-flex justify-content-center align-items-center"
    >
      <div class="text-center">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <h5 class="mt-2 text-white">Generando factura...</h5>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ImagesNavbar from "./components/ImagesNavbar.vue";
import SuccessMessage from "./components/SuccessMessage.vue";
import ImagesInvoice from "./components/Invoice.vue";

export default {
  name: "App",
  components: { ImagesNavbar, SuccessMessage, ImagesInvoice },

  data() {
    return {
      searchQuery: "",
      images: [],
      sellers: [],
      showMessage: false,
      buttonsDisabled: false,
      selectedImageIndex: null,
      fullInvoice: null,
      loading: false,
      winnerIndex: null,
      soldItems: 0,
    };
  },
  mounted() {
    this.fetchSellers();
  },
  methods: {
    async fetchImages() {
      this.selectedImageIndex = null;
      this.buttonsDisabled = false;
      const apiKey = process.env.VUE_APP_API_KEY;
      const cx = process.env.VUE_APP_CX;
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${this.searchQuery}`;

      try {
        const response = await axios.get(url);
        this.images = response.data.items.slice(0, this.sellers.length);
        console.log(this.images);
      } catch (error) {
        console.error(error);
      }
    },
    async chooseImage(sellerId) {
      this.selectedImageIndex = sellerId;
      this.buttonsDisabled = true;
      this.showMessage = true;
      this.soldItems++;
      const seller = this.sellers.find((e) => e.id === sellerId + 1);
      if (seller) {
        for (let i = 0; i < 3; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          seller.points += 1;
        }
        if (seller.points >= 20) {
          this.winnerIndex = seller.id;
          this.createInvoice();
        }
      }
      setTimeout(() => {
        this.showMessage = false;
      }, 2000);
    },
    imageOnError(event) {
      event.target.src =
        "https://publicidadx.com/wp-content/uploads/2022/09/reparacion-error-404-Madrid.jpg";
    },
    async createInvoice() {
      try {
        this.loading = true;
        const currentDate = new Date();
        const dueDate = new Date(
          new Date().setMonth(currentDate.getMonth() + 3)
        );
        const formatDate = (date) => date.toISOString().split("T")[0];
        const response = await axios({
          method: "post",
          url: "https://api.alegra.com/api/v1/invoices",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: `Basic ${process.env.VUE_APP_TOKEN}`,
          },
          data: {
            client: { id: 1 },
            currency: { newKey: "New Value" },
            status: "draft",
            items: [
              {
                quantity: this.soldItems * 3,
                description: "Foto",
                price: 100,
                id: 1,
              },
            ],
            payments: [
              {
                account: { id: 1 },
                currency: { code: "CLP", exchangeRate: 1 },
                amount: this.soldItems * 300,
                paymentMethod: "cash",
                annotations: "100",
                observations: "100",
                date: formatDate(new Date()),
              },
            ],
            date: formatDate(new Date()),
            dueDate: formatDate(dueDate),
            priceList: 1,
            seller: this.winnerIndex,
          },
        });
        this.fullInvoice = response.data;
        console.log("la factura es");
        console.log(this.fullInvoice);
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    fetchSellers() {
      const options = {
        headers: {
          accept: "application/json",
          authorization: `Basic ${process.env.VUE_APP_TOKEN}`,
        },
      };

      axios
        .get("https://api.alegra.com/api/v1/sellers", options)
        .then((response) => {
          const sellers = response.data.map((seller) => ({
            id: seller.id,
            points: 0,
            name: seller.name,
          }));

          this.sellers = sellers;
        })
        .catch((error) => {
          console.error(error);
        });
    },

    finish() {
      this.sellers.forEach((seller) => {
        seller.points = 0;
      });
      this.images = [];
      this.fullInvoice = null;
      this.loading = false;
    },
  },
};
</script>

<style>
#app {
  width: 100%;
}

body,
html {
  font-family: "Urbanist", sans-serif !important;
}

.infoText {
  color: #909090;
  font-family: "Inter", sans-serif !important;
  font-weight: 400;
}
.main {
  margin-top: 4vh;
  height: 90vh;
}

.search-container {
  width: 40%;
}

.images-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.title {
  font-weight: 700;
}

.title span {
  font-weight: 800;
  color: rgb(61, 184, 149);
}

input[type="text"] {
  margin-top: 80px;
  margin-bottom: 10px;
  padding: 10px 10px 10px 50px;
  width: 300px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.lens-icon {
  position: absolute;
  left: 10px;
  top: 75%;
  transform: translateY(-50%);
}

.scoreTag {
  position: absolute;
  top: 0;
  left: 0;
  background-color: green;
  color: white;
  border-radius: 50%;
  padding: 5px 10px;
  transform: translate(-50%, -50%);
  font-size: 0.8em;
}
.image-container {
  position: relative;
}

button {
  display: flex;
  width: 148px;
  padding: 8px 16px 8px 12px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 8px !important;
  background: var(--color-trust-primary-normal, rgb(71, 222, 179));
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: rgb(61, 184, 149);
}

.image-container {
  position: relative;
  display: inline-block;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
}

.result-image {
  height: 200px;
  border-radius: 5px;
}

.seller-score {
  margin-top: 20px;
  font-size: 16px;
}

.buy-btn {
  padding: 10px 20px;
  border-radius: 5px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #313638;
}

.buy-btn:hover {
  background-color: transparent !important;
}

.buy-btn h6 {
  transform: translateX(5px);
  opacity: 0.6;
  transition: opacity 0.6s ease-in-out, visibility 0.6s ease-in-out;
  transition: transform 0.3s ease-in-out;
}

.buy-btn:hover h6 {
  transform: translateX(20px);
  opacity: 1;
  color: #313638;
}

.bill-ico-container {
  border-radius: 12px;
  margin-right: 12px;
}

.buy-btn:hover .bill-ico-container {
  transition: background-color 0.3s ease-in-out;
  background-color: rgb(71 222 179);
}

.buy-btn.disabled,
.buy-btn.disabled:hover .bill-ico-container {
  background-color: transparent;
  cursor: not-allowed;
}

.buy-btn:not(.disabled):hover .bill-ico-container {
  background-color: rgb(71, 222, 179);
}

.image-container:not(.selected):hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(71, 222, 179, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-container.selected {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(71, 222, 179, 0.5) !important;
}

.image-container.selected .bill-ico-container {
  background-color: rgb(71 222 179);
}

.image-container:hover .bill-ico-container {
  background-color: rgb(71, 222, 179);
}

.image-container {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(71, 222, 179, 0.5);
}

.disabled {
  pointer-events: none;
}

.scoreTag {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-40%, -40%);
  border-radius: 50%;
  background-color: rgb(71, 222, 179);
  color: white;
  font-weight: 700;
  width: 40px;
  height: 40px;
  text-align: center;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  color: rgb(71, 222, 179);
  font-size: 24px;
}

@media (max-width: 1300px) {
  .main {
    flex-direction: column;
    height: 100%;
  }
  .result-image {
    height: 80px;
    border-radius: 5px;
  }
  .images-container {
    margin-top: 20px;
  }
}
@media (max-width: 600px) {
  .search-container {
    width: 80%;
    align-items: baseline;
  }
  .alegra-ico {
    margin-left: 20px;
  }
  .images-container {
    margin-top: 20px;
    grid-template-columns: repeat(1, 1fr);
  }
  .result-image {
    height: 80px;
    border-radius: 5px;
  }
  .bill-ico {
    width: 30px;
    height: 30px;
  }
}
@media (max-width: 300px) {
  #app {
    width: 100vw;
  }
  .search-container {
    width: 80%;
  }
  input {
    width: 230px !important;
  }
  .alegra-ico {
    margin-left: 20px;
  }
  .images-container {
    margin-top: 20px;
    margin-left: 0px;
    grid-template-columns: repeat(1, 1fr);
  }
  .result-image {
    height: 80px;
    border-radius: 5px;
  }
  .bill-ico {
    width: 30px;
    height: 30px;
  }
}
</style>
