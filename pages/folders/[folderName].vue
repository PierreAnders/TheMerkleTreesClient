<template>
  <div class="min-h-screen px-8 pt-8">
    <BurgerMenu />
    <div class="flex items-center justify-center pt-8">
      <h1 class="pr-3 tracking-wider text-light-gray">
        {{ folderName.toUpperCase() }}
      </h1>
      <IconFolder />
    </div>
    <MetaMaskConnector @update-encryption-key="handleEncryptionKey" />
    <p class="text-light-gray">
      Clé de chiffrement parent: {{ encryptionKey }}
    </p>
    <ul class="flex flex-col w-3/4 mx-auto mt-12 mb-8 md:w-2/3 lg:w-1/2">
      <li
        v-for="file in fileList"
        :key="file.id"
        class="flex flex-col justify-between mt-6 text-white md:flex-row"
      >
        <div class="flex space-x-2 wrap">
          <IconDocument class="opacity-50" />
          <span class="text-sm">{{ file.name }}</span>
        </div>
        <div class="flex justify-end mt-2 space-x-2 flex-nowrap md:mt-0">
          <button @click="deleteFile(file.name)">
            <IconSubmenuDeleteFolder
              :color="'#553348'"
              class="w-5 h-5 transition-transform transform md:w-6 md:h-6 hover:scale-110"
            />
          </button>
          <button @click="downloadFile(file.name)">
            <IconDownload
              class="w-5 h-5 transition-transform transform md:w-6 md:h-6 hover:scale-110"
            />
          </button>
          <button @click="openFile(file.name)">
            <IconOpen
              class="w-5 h-5 transition-transform transform md:w-6 md:h-6 hover:scale-110"
            />
          </button>
        </div>
      </li>
    </ul>
    <div class="flex justify-center">
      <div class="flex flex-col justify-center">
        <label for="fileInput" class="text-light-gray">
          <div
            id="fileNameLabel"
            class="flex flex-col justify-center cursor-pointer text-light-gray"
          >
            <IconUpload
              class="pb-2 mx-auto transition-transform transform w-14 hover:scale-110"
            />
          </div>
          <input
            type="file"
            id="fileInput"
            ref="fileInput"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            class="p-2 border rounded-md bg-neutral-300 text-neutral-800 focus:outline-none focus:border-amber-800"
            @change="uploadFile"
            style="display: none"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import CryptoJS from "crypto-js";
import { useTextContentStore } from "../../textContentStore.js";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default {
  data() {
    return {
      fileList: [],
      folderName: "",
      encryptionKey: null,
    };
  },
  methods: {
    handleEncryptionKey(encryptionKey) {
      this.encryptionKey = encryptionKey;
      console.log("Encryption key received:", encryptionKey);
    },
    loadFileList() {
      if (process.client) {
        const jwtToken = this.getJwtToken();

        axios
          .get(`${BASE_URL}/api/Files/user/category/${this.folderName}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            this.fileList = response.data;
          })
          .catch((error) => console.error(error));
      } else {
        console.error(
          "Le code est exécuté côté serveur (SSR), localStorage n'est pas disponible."
        );
      }
    },

    deleteFile(fileName) {
      const jwtToken = this.getJwtToken();

      axios
        .delete(`${BASE_URL}/api/Files/${fileName}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        })
        .then(() => {
          this.loadFileList();
        })
        .catch((error) => console.error(error));
    },

    async downloadFile(fileName) {
      try {
        const jwtToken = this.getJwtToken();
        const axiosConfig = {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          responseType: "blob",
        };

        const response = await axios.get(
          `${BASE_URL}/api/Files/decrypt/${fileName}`,
          axiosConfig
        );

        const blob = await response.data.arrayBuffer();

        // Séparer le IV du contenu chiffré
        const iv = new Uint8Array(blob.slice(0, 12)); // Les 12 premiers octets sont l'IV
        const encryptedContent = blob.slice(12); // Le reste est le contenu chiffré

        // Vérifiez que la clé de chiffrement a la bonne taille
        const keyArrayBuffer = new Uint8Array(this.encryptionKey);
        if (keyArrayBuffer.length !== 16 && keyArrayBuffer.length !== 32) {
          console.error(
            "La clé de chiffrement doit être de 128 bits (16 octets) ou 256 bits (32 octets)."
          );
          return;
        }

        // Importer la clé de chiffrement
        const key = await crypto.subtle.importKey(
          "raw",
          keyArrayBuffer,
          { name: "AES-GCM" },
          false,
          ["decrypt"]
        );

        // Déchiffrer le contenu
        const decryptedArrayBuffer = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: iv,
          },
          key,
          encryptedContent
        );

        // Créer un Blob avec le contenu déchiffré
        const decryptedBlob = new Blob([decryptedArrayBuffer], {
          type: response.data.type,
        });

        // Télécharger le fichier
        const url = window.URL.createObjectURL(decryptedBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(error);
      }
    },

    async openFile(fileName) {
      try {
        // Téléchargement du fichier chiffré
        const jwtToken = this.getJwtToken();
        const axiosConfig = {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          responseType: "arraybuffer", // Réponse sous forme de tableau d'octets
        };

        const response = await axios.get(
          `${BASE_URL}/api/Files/decrypt/${fileName}`,
          axiosConfig
        );

        const blob = response.data;

        // Séparer le IV du contenu chiffré
        const iv = new Uint8Array(blob.slice(0, 12)); // Les 12 premiers octets sont l'IV
        const encryptedContent = blob.slice(12); // Le reste est le contenu chiffré

        // Vérifiez que la clé de chiffrement a la bonne taille
        const keyArrayBuffer = new Uint8Array(this.encryptionKey);
        if (keyArrayBuffer.length !== 16 && keyArrayBuffer.length !== 32) {
          console.error(
            "La clé de chiffrement doit être de 128 bits (16 octets) ou 256 bits (32 octets)."
          );
          return;
        }

        // Importer la clé de chiffrement
        const key = await crypto.subtle.importKey(
          "raw",
          keyArrayBuffer,
          { name: "AES-GCM" },
          false,
          ["decrypt"]
        );

        // Déchiffrer le contenu
        const decryptedArrayBuffer = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: iv,
          },
          key,
          encryptedContent
        );

        // Vérifiez le type de fichier pour le traitement approprié
        const contentType = response.headers["content-type"];
        const textDecoder = new TextDecoder(); // Si vous vous attendez à du texte
        const decryptedText = textDecoder.decode(decryptedArrayBuffer);

        // Affichage du contenu déchiffré
        if (contentType.startsWith("text/")) {
          // Afficher le texte directement dans une nouvelle fenêtre
          const newWindow = window.open();
          newWindow.document.write(`<pre>${decryptedText}</pre>`);
          newWindow.document.close();
        } else {
          // Pour d'autres types de fichiers (par exemple, PDF, images, etc.), télécharger le fichier déchiffré
          const blobFile = new Blob([decryptedArrayBuffer], {
            type: contentType,
          });
          const url = window.URL.createObjectURL(blobFile);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Erreur lors de l'ouverture du fichier:", error);
      }
    },

    // Méthode pour obtenir le type MIME à partir de l'extension du fichier
    getMimeType(fileType) {
      switch (fileType) {
        case "pdf":
          return "application/pdf";
        case "png":
          return "image/png";
        case "jpg":
        case "jpeg":
          return "image/jpeg";
        default:
          return "application/octet-stream"; // Type par défaut
      }
    },

    getFileType(fileName) {
      // Extraire l'extension du fichier
      const parts = fileName.split(".");

      // Vérification si le fichier a plusieurs extension et retourne la dernière
      if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
      }
      return "";
    },

    displayTextFile(textData) {
      console.log("Displaying text file content:");
      console.log(textData);
    },

    async uploadFile() {
      const jwtToken = this.getJwtToken();
      const formData = new FormData();
      const fileInput = this.$refs.fileInput;

      if (fileInput.files.length === 0) {
        console.error("Aucun fichier sélectionné.");
        return;
      }

      const file = fileInput.files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Vérifiez la longueur de la clé avant de l'utiliser
      if (
        this.encryptionKey.byteLength !== 16 &&
        this.encryptionKey.byteLength !== 24 &&
        this.encryptionKey.byteLength !== 32
      ) {
        console.error(
          "La clé de chiffrement doit avoir une longueur de 16, 24 ou 32 octets."
        );
        return;
      }

      // Chiffrement du contenu avec Web Crypto API
      const key = await crypto.subtle.importKey(
        "raw",
        this.encryptionKey,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );

      const iv = crypto.getRandomValues(new Uint8Array(12)); // Génération d'un vecteur d'initialisation aléatoire
      const encryptedArrayBuffer = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        arrayBuffer
      );

      // Convertir le contenu chiffré en blob avant l'envoi
      const encryptedBlob = new Blob([iv, encryptedArrayBuffer], {
        type: file.type,
      });

      formData.append("file", encryptedBlob, file.name);
      formData.append("category", this.folderName);
      formData.append("isPublic", true);
      formData.append("userAddress", "user-address");

      axios
        .post(`${BASE_URL}/api/Files/upload`, formData, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          this.loadFileList();
          fileInput.value = "";
        })
        .catch((error) => console.error(error));
    },

    getJwtToken() {
      const jwtToken = localStorage.getItem("access_token");

      if (!jwtToken) {
        console.error("Le jeton JWT n'est pas disponible.");
        this.$router.push("/");
        return;
      }
      return jwtToken;
    },

    displayTextFile(textData, openInNewWindow = false) {
      // Conversion en UTF-8 avec TextDecoder
      const decoder = new TextDecoder("utf-8");
      const decodedText = decoder.decode(textData);

      if (openInNewWindow) {
        // Ouvrir le contenu dans une nouvelle fenêtre
        const newTab = window.open();
        newTab.document.write("<pre>" + decodedText + "</pre>");
      }
    },
  },

  setup() {
    definePageMeta({
      middleware: ["auth"],
    });
  },

  created() {
    this.folderName = this.$route.params.folderName;
    this.loadFileList();
  },
};
</script>
