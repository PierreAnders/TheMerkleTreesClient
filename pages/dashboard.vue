<template>
    <div class="min-h-screen px-8 pt-8">
        <BurgerMenu />
        <div class="flex items-center justify-center pt-8">
            <h1 class="pr-3 tracking-wider text-light-gray">DASHBOARD</h1>
            <IconDashboard :color="'#334155'" class="mr-2" />
        </div>
        <div class="flex flex-col items-center justify-center mt-12">
            <div
                class="flex items-center justify-between h-8 px-4 mb-4 text-sm text-white rounded-md bg-dark-gray placeholder-light-gray w-72">
                <div class="text-light-gray"> Age : </div>
                <div>{{ calculateAge(userInfo.birth_date) }} ans</div>
            </div>
            <div
                class="flex items-center justify-between h-8 px-4 mb-4 text-sm text-white rounded-md bg-dark-gray placeholder-light-gray w-72">
                <div class="text-light-gray"> Taille : </div>
                <div>{{ healthInfo.size }} m</div>
            </div>
            <div
                class="flex items-center justify-between h-8 px-4 mb-4 text-sm text-white rounded-md bg-dark-gray placeholder-light-gray w-72">
                <div class="text-light-gray"> Poids : </div>
                <div>{{ healthInfo.weight }} kg</div>
            </div>
            <div
                class="flex items-center justify-between h-8 px-4 mb-4 text-sm text-white rounded-md bg-dark-gray placeholder-light-gray w-72">
                <div class="text-light-gray"> IMC : </div>
                <div>{{ (healthInfo.weight / (healthInfo.size * healthInfo.size)).toFixed(1) }}</div>
            </div>
            <div
                class="flex items-center justify-between h-8 px-4 mb-4 text-sm text-white rounded-md bg-dark-gray placeholder-light-gray w-72">
                <div class="text-light-gray"> Dépenses : </div>
                <div>{{ totalExpenses.toFixed(2) }} €</div>
            </div>
            <div
                class="flex items-center justify-between h-8 px-4 mb-4 text-sm text-white rounded-md bg-dark-gray placeholder-light-gray w-72">
                <div class="text-light-gray"> Recettes : </div>
                <div>{{ totalIncomes.toFixed(2) }} €</div>
            </div>
            <div
                class="flex items-center justify-between h-8 px-4 mb-4 text-sm text-white rounded-md bg-dark-gray placeholder-light-gray w-72">
                <div class="text-light-gray"> Balance : </div>
                <div>{{ (totalIncomes - totalExpenses).toFixed(2) }} €</div>
            </div>
        </div>
    </div>
</template>
  
<script>
import axios from 'axios'
import moment from 'moment'
const BASE_URL = import.meta.env.VITE_BASE_URL

export default {
    data() {
        return {
            totalIncomes: 0,
            totalExpenses: 0,
            incomes: {},
            expenses: {},
            healthInfo: {
                gender: "homme",
                weight: "",
                size: "",
                social_security_number: "",
                blood_group: "",
                doctor: "",
            },
            userInfo: {
                lastname: "",
                firstname: "",
                birth_date: "",
                email: "",
            },
        };
    },
    methods: {
        calculateAge(birthDate) {
            const today = moment() // Création d'un objet moment avec la date du jour
            const birthDateObj = moment(birthDate) // Création d'un objet moment avec la date de naissance
            const age = today.diff(birthDateObj, 'years') // Calcul de la différence entre les deux dates en années

            return age;
        },

        async loadHealthInfo() {
            try {
                const token = this.getJwtToken()

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const response = await axios.get(`${BASE_URL}/user_health`, { headers })

                if (response.status === 200) {
                    this.healthInfo = response.data
                } else {
                    console.error("Échec du chargement des informations de santé.")
                }
            } catch (error) {
                console.error("Erreur lors du chargement des informations de santé :", error)
            }
        },

        async getAllIncomes() {
            try {
                const token = this.getJwtToken()

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const response = await axios.get(`${BASE_URL}/incomes`, { headers })

                if (response.status === 200) {
                    this.incomes = response.data
                    this.incomes.sort((a, b) => b.price - a.price)
                    this.totalIncomes = this.calculateTotal(this.incomes)
                } else {
                    console.error("Échec de la récupération des recettes.")
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des recettes :", error)
            }
        },

        async getAllExpenses() {
            try {
                const token = this.getJwtToken()

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const response = await axios.get(`${BASE_URL}/expenses`, { headers })

                if (response.status === 200) {
                    this.expenses = response.data
                    this.expenses.sort((a, b) => b.price - a.price)
                    this.totalExpenses = this.calculateTotal(this.expenses)
                } else {
                    console.error("Échec de la récupération des dépenses.")
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des dépenses :", error)
            }
        },

        calculateTotal(elements) {
            return elements.reduce((total, element) => total + parseFloat(element.price), 0)
        },

        async getUserInfo() {
            try {
                const token = this.getJwtToken()

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const response = await axios.get(`${BASE_URL}/users/info`, { headers })

                if (response.status === 200) {
                    this.userInfo = response.data
                    console.log(this.userInfo)
                } else {
                    console.error("Échec de la récupération des données de l'utilisateur.")
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données de l'utilisateur :", error)
            }
        },

        getJwtToken() {
            const jwtToken = localStorage.getItem('access_token')

            if (!jwtToken) {
                console.error('Le jeton JWT n\'est pas disponible.')
                this.$router.push('/')
                return;
            }
            return jwtToken;
        },
    },

    setup() {
        definePageMeta({
            middleware: ['auth'],
        });
    },

    created() {
        this.getAllIncomes()
        this.getAllExpenses()
        this.loadHealthInfo()
        this.getUserInfo()
    },
};
</script>

<style>
.aria {
    color: white;
}
</style>