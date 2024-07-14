<template>
  <div class="min-h-screen px-8 pt-8">
    <BurgerMenu />
    <div class="flex items-center justify-center pt-8 ">
      <h1 class="pr-3 tracking-wider text-light-gray">CHAT</h1>
      <IconChat :color="'#334155'" />
    </div>
    <div class="mt-12">
      <div class="flex justify-between w-full mx-auto mt-3 sm:10/12 md:w-9/12 lg:w-8/12 xl:w-7/12 2xl:w-6/12">
        <div>
          <select v-model="selectedFolder"
            class="w-36 px-2 py-0.5 text-xs bg-black border rounded-md text-light-gray border-light-gray">
            <option v-for="folder in userFolders" :key="folder" :value="folder">{{ folder.name }}</option>
          </select>
        </div>
        <div>
          <select class="w-36 px-2 py-0.5 text-xs bg-black border rounded-md text-light-gray border-light-gray"
            v-model="selectedModel">
            <option class="text-xs" value="gpt-4">gpt-4-1106-preview</option>
            <option class="text-xs" value="gpt-4">gpt-4</option>
            <option class="text-xs" value="gpt-4">gpt-4-32k</option>
            <option class="text-xs" value="gpt-3.5-turbo">gpt-3.5-turbo-1106</option>
          </select>
        </div>
      </div>
      <div v-for="message in messages" :key="message.id"
        :class="[message.role === 'user' ? 'bg-blue-gray' : 'bg-light-gray text-black', 'p-2 rounded-md mt-4 mb-2 w-full sm:10/12 md:w-9/12 lg:w-8/12 xl:w-7/12 2xl:w-6/12 mx-auto']">
        {{ message.content }}
      </div>
      <div
        class="flex items-center justify-between w-full mx-auto mt-4 input-container sm:10/12 md:w-9/12 lg:w-8/12 xl:w-7/12 2xl:w-6/12">
        <textarea v-model="userMessage" placeholder="Posez une question..."
          class="flex-1 p-2 border-2 border-black rounded-md focus:outline-none focus:border-light-gray bg-blue-gray"></textarea>
      </div>
      <div class="flex justify-between w-full mx-auto mt-3 sm:10/12 md:w-9/12 lg:w-8/12 xl:w-7/12 2xl:w-6/12">
        <button @click="startSpeechRecognition">
          <IconMicro class="transition-transform transform hover:scale-110" />
        </button>
        <button @click="sendMessage">
          <div v-if="isLoading" class="spinner"></div>
          <IconEnter v-else class="transition-transform transform hover:scale-110" />
        </button>
      </div>
      <div id="speechOutput" class="mt-4 text-lg font-semibold"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
const BASE_URL = import.meta.env.VITE_BASE_URL

export default {
  data() {
    return {
      messages: [],
      userMessage: '',
      isLoading: false,
      selectedModel: 'gpt-4',
      selectedFolder: null,
      userFolders: [],
      jwtToken: null,
    }
  },

  async mounted() {
    await this.fetchUserFolders()
    if (this.userFolders.length > 0) {
      this.selectedFolder = this.userFolders[0];
    }

    this.jwtToken = localStorage.getItem('access_token')
  },

  methods: {
    async sendMessage() {
      // Vérification que le message n'est pas vide après avoir supprimé les espaces
      if (this.userMessage.trim() === '') return;

      this.jwtToken = localStorage.getItem('access_token')
      const sessionId = this.jwtToken.slice(0, 120)
      console.log('sessionId', sessionId)
      this.isLoading = true
      console.log('this.selectedFolder', this.selectedFolder.name)
      try {
        const response = await axios.post(`${BASE_URL}/chatWithData/${this.selectedModel}/${this.selectedFolder.name}`, {
          session_id: sessionId,
          query: this.userMessage,
          folder: this.selectedFolder
        }, {
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`,
            'Content-Type': 'application/json'
          }
        });

        const assistantReply = response.data.answer;

        // Ajouter le message de l'utilisateur et la réponse de l'assistant à la liste des messages.
        this.messages.push(
          { role: 'user', content: this.userMessage },
          { role: 'assistant', content: assistantReply }
        );

        // Création d'un nouvel objet SpeechSynthesisUtterance pour la synthèse vocale.
        const utterance = new SpeechSynthesisUtterance(assistantReply)

        // Obtenir la liste des voix disponibles
        const voices = speechSynthesis.getVoices()

        // Choisir la deuxième voix de la liste
        utterance.voice = voices[1]

        // Accélerer la vitesse de lecture
        utterance.rate = 1.5

        // Envoyer le message à l'API SpeechSynthesis pour être lu à haute voix.
        speechSynthesis.speak(utterance)

        // Réinitialiser le message de l'utilisateur
        this.userMessage = ''

      } catch (error) {
        console.error(`Erreur lors de l'envoi de la requête : ${error}`)

      } finally {
        this.isLoading = false
      }
    },

    async fetchUserFolders() {
      try {
        this.jwtToken = localStorage.getItem('access_token')
        const headers = { Authorization: `Bearer ${this.jwtToken}` };

        const response = await axios.get(`${BASE_URL}/folders`, { headers });

        if (response.status === 200) {
          const userFolders = response.data;
          this.userFolders = userFolders;
          console.log('userFolders', userFolders)
        } else {
          console.error("Failed to retrieve user folders.");
        }
      } catch (error) {
        console.error("Error fetching user folders:", error);
      }
    },

    async startSpeechRecognition() {
      try {
        // Vérification de la prise en charge de la reconnaissance vocale
        if ('webkitSpeechRecognition' in window) {
          // Création d'une nouvelle instance de la reconnaissance vocale
          const recognition = new window.webkitSpeechRecognition()

          // Définition de la langue pour la reconnaissance vocale
          recognition.lang = 'fr-FR'

          // Lorsque la reconnaissance vocale démarre, on passe le statut de chargement à true
          recognition.onstart = () => {
            this.isLoading = true
          };

          // Lorsque la reconnaissance vocale récupère des résultats, on les affiche et on envoie le message
          recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript
            this.userMessage = speechResult
            this.sendMessage()
          };

          // Gestion des erreurs de la reconnaissance vocale
          recognition.onerror = (event) => {
            console.error('Erreur de reconnaissance vocale', event.error)
            this.isLoading = false
          };

          // Une fois la reconnaissance vocale terminée, on passe le statut de chargement à false
          recognition.onend = () => {
            this.isLoading = false
          };

          // Lancement de la reconnaissance vocale
          recognition.start()
        } else {
          // Appel de la fonction pour gérer l'erreur de non-prise en charge de reconnaissance vocale
          console.error('La reconnaissance vocale n\'est pas prise en charge dans ce navigateur.')
        }
      } catch (error) {
        // Log des erreurs
        console.error('Erreur lors de l\'initialisation de la reconnaissance vocale', error)
      }
    },
  },

  setup() {
    definePageMeta({
      middleware: ['auth'],
    });
  },
}
</script>
