<template>
  <div class="min-h-screen px-8 pt-8">
    <BurgerMenu />
    <div class="flex items-center justify-center pt-8">
      <h1 class="pr-3 tracking-wider text-light-gray">INSCRIPTION</h1>
      <IconRegister :color="'#334155'" />
    </div>
    <form @submit.prevent="register">
      <div class="flex flex-col items-center justify-center mt-12">
        <div class="w-64 pb-3">
          <label class="sr-only" for="email">Email:</label>
          <input
            class="w-64 h-8 px-4 text-sm text-white border-2 rounded-md bg-dark-gray placeholder-light-gray border-dark-gray focus:outline-none focus:border-blue"
            type="email"
            id="email"
            v-model="email"
            placeholder="Email"
          />
        </div>
        <div class="flex justify-between w-64 py-2">
          <label class="sr-only" for="mot_de_passe">Mot de passe:</label>
          <input
            class="flex w-64 h-8 px-4 mr-2 text-sm text-white border-2 rounded-md placeholder-light-gray bg-dark-gray border-dark-gray focus:outline-none focus:border-blue"
            type="password"
            id="mot_de_passe"
            v-model="password"
            @input="validatePassword"
            placeholder="Mot de passe"
          />
          <button type="submit">
            <IconEnter class="transition-transform transform hover:scale-110" />
          </button>
        </div>
        <div v-if="registerError" class="w-64 pb-3 text-sm text-white">
          {{ registerError }}
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default {
  data() {
    return {
      email: "",
      password: "",
      isPasswordValid: false,
      registerError: "",
    };
  },

  methods: {
    async register() {
      try {
        if (!this.isPasswordValid) {
          this.registerError = "Veuillez choisir un mot de passe sécurisé";
          console.error("Mot de passe non valide");
          return;
        }
        console.log("Email:", this.email);
        console.log("Password:", this.password);

        console.log(BASE_URL);
        try {
          const response = await axios.post(`${BASE_URL}/api/Auth/register`, {
            email: this.email,
            password: this.password,
          });
          console.log("Inscription réussie");
          console.log("Response:", response);
        } catch (error) {
          console.error("Error:", error);
        }
        this.$router.push("/");
      } catch (error) {
        if (error.response && error.response.data) {
          this.registerError = error.response.data.message;
        } else {
          this.registerError =
            "Une erreur s'est produite lors de l'inscription.";
        }
        console.error("Erreur d'inscription :", error);
      }
    },
    validatePassword() {
      const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
      this.isPasswordValid = passwordRegex.test(this.password);
    },
  },
};
</script>

<style>
.aria {
  color: white;
}
</style>
