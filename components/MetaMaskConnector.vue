<template>
  <div>
    <button class="text-xs text-light-gray" @click="connectMetaMask">Connecter MetaMask</button>
    <p class="text-xs text-light-gray" v-if="account">
      Compte connecté : {{ account }}
    </p>
    <button class="text-xs text-light-gray" @click="generateEncryptionKey">Générer une clé de chiffrement</button>
    <button class="text-xs text-light-gray" @click="fetchEncryptionKey">Récupérer la clé de chiffrement</button>
    <p class="text-xs text-light-gray" v-if="encryptionKey">Clé de chiffrement : {{ encryptionKey }}</p>
  </div>
</template>

<script>
import Web3 from "web3";

export default {
  data() {
    return {
      account: null,
      encryptionKey: null,
      contract: null,
      networkId: null,
    };
  },
  methods: {
    async connectMetaMask() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const web3 = new Web3(window.ethereum);

          this.networkId = await web3.eth.net.getId();
          console.log("Réseau MetaMask connecté :", this.networkId);

          const accounts = await web3.eth.getAccounts();
          this.account = accounts[0];
          console.log("Compte connecté :", this.account);

          window.ethereum.on("chainChanged", (chainId) => {
            console.log("Changement de réseau détecté :", chainId);
          });

          window.ethereum.on("accountsChanged", (accounts) => {
            console.log("Changement de compte détecté :", accounts);
            this.account = accounts[0];
          });

          const contractABI = [
            {
              inputs: [],
              name: "generateKey",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "user",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "bytes32",
                  name: "key",
                  type: "bytes32",
                },
              ],
              name: "KeyGenerated",
              type: "event",
            },
            {
              inputs: [],
              name: "getKey",
              outputs: [
                {
                  internalType: "bytes32",
                  name: "",
                  type: "bytes32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ];

          this.contract = new web3.eth.Contract(
            contractABI,
            "0xf657c05b903aa0a6f9af1704ccbfe0834d2193f6"
          );

          console.log("Contrat initialisé avec succès !");
        } catch (error) {
          console.error("Erreur lors de la connexion à MetaMask :", error);
        }
      } else {
        console.error("MetaMask n'est pas installé.");
      }
    },

    async generateEncryptionKey() {
      if (this.contract && this.account) {
        try {
          const receipt = await this.contract.methods
            .generateKey()
            .send({ from: this.account });
          console.log("Transaction reçue :", receipt);
          console.log("Clé générée avec succès.");
        } catch (error) {
          console.error("Erreur lors de la génération de la clé :", error);
        }
      }
    },

    async fetchEncryptionKey() {
      if (!this.contract || !this.account) {
        console.error("Le contrat ou le compte n'est pas défini.");
        return;
      }

      console.log("Récupération de la clé de chiffrement...");
      console.log("Contrat :", this.contract);
      console.log("Compte :", this.account);

      try {
        console.log("Appel à la fonction getKey...");

        // Ajout d'un log avant et après l'appel pour capturer ce qui se passe
        console.log("Avant l'appel à getKey()");
        const key = await this.contract.methods.getKey().call({ from: this.account });
        console.log("Après l'appel à getKey(), résultat brut :", key);

        // Vérification de la valeur récupérée
        if (key && key !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
          this.encryptionKey = key;
          console.log("Clé de chiffrement récupérée :", this.encryptionKey);
        } else {
          console.error("Aucune clé générée ou clé invalide.");
        }
      } catch (error) {
        // Capture des erreurs plus détaillée
        console.error("Erreur lors de l'appel à getKey :", error);
        console.error("Type de l'erreur :", error.name);
        console.error("Message d'erreur :", error.message);
      }
    },
  },
};
</script>