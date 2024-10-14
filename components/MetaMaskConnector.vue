<template>
  <div>
    <button class="text-xs text-light-gray" @click="connectMetaMask">
      Connecter MetaMask
    </button>
    <p class="text-xs text-light-gray" v-if="account">
      Compte connecté : {{ account }}
    </p>
    <button class="text-xs text-light-gray" @click="generateEncryptionKey">
      Générer une clé de chiffrement
    </button>
    <p class="text-xs text-light-gray">Ou</p>
    <button class="text-xs text-light-gray" @click="fetchEncryptionKey">
      Récupérer la clé de chiffrement
    </button>
    <p class="text-xs text-light-gray" v-if="encryptionKey">
      Clé de chiffrement composant : {{ encryptionKey }}
    </p>
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
    emitEncryptionKey() {
      this.$emit("update-encryption-key", this.encryptionKey);
    },

    // Méthode pour vérifier la connexion à MetaMask au chargement du composant
    async checkMetaMaskConnection() {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();

        if (accounts.length > 0) {
          this.account = accounts[0];
          console.log("Compte déjà connecté :", this.account);
          this.initializeContract(web3); // Initialiser le contrat
          await this.fetchEncryptionKey(); // Récupérer automatiquement la clé de chiffrement
        } else {
          console.log("MetaMask non connecté. Vous devez vous connecter.");
        }
      } else {
        console.error("MetaMask n'est pas installé.");
      }
    },

    async connectMetaMask() {
      if (window.ethereum) {
        try {
          // Demande de connexion à MetaMask
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const web3 = new Web3(window.ethereum);

          this.networkId = await web3.eth.net.getId();
          console.log("Réseau MetaMask connecté :", this.networkId);

          const accounts = await web3.eth.getAccounts();
          this.account = accounts[0];
          console.log("Compte connecté :", this.account);

          this.initializeContract(web3); // Initialiser le contrat

          await this.fetchEncryptionKey(); // Récupérer la clé de chiffrement immédiatement

          // Gérer les changements de compte et de réseau
          window.ethereum.on("accountsChanged", async (accounts) => {
            console.log("Changement de compte détecté :", accounts);
            this.account = accounts[0];
            await this.fetchEncryptionKey(); // Récupérer la clé à chaque changement de compte
          });

          window.ethereum.on("chainChanged", (chainId) => {
            console.log("Changement de réseau détecté :", chainId);
            window.location.reload(); // Recharger la page en cas de changement de réseau
          });
        } catch (error) {
          console.error("Erreur lors de la connexion à MetaMask :", error);
        }
      }
    },

    initializeContract(web3) {
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

    hexToArrayBuffer(hexString) {
      const byteArray = new Uint8Array(
        hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
      );
      return byteArray.buffer;
    },

    async fetchEncryptionKey() {
      if (!this.contract || !this.account) {
        console.error("Le contrat ou le compte n'est pas défini.");
        return;
      }

      try {
        const key = await this.contract.methods
          .getKey()
          .call({ from: this.account });
        if (
          key &&
          key !==
            "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) {
          const hexKey = key.substring(2);
          const byteArray = this.hexToArrayBuffer(hexKey);

          // Vérification de la longueur de la clé (doit être 16, 24 ou 32 octets)
          if (
            byteArray.byteLength === 16 ||
            byteArray.byteLength === 24 ||
            byteArray.byteLength === 32
          ) {
            this.encryptionKey = byteArray;
            console.log("Clé de chiffrement récupérée :", this.encryptionKey);
            this.emitEncryptionKey();
          } else {
            console.error(
              "La clé de chiffrement doit avoir une longueur de 16, 24 ou 32 octets."
            );
          }
        } else {
          console.error("Aucune clé générée ou clé invalide.");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la clé de chiffrement :",
          error
        );
      }
    },
  },

  // Appeler la méthode pour vérifier MetaMask dès que le composant est créé
  created() {
    this.checkMetaMaskConnection();
  },
};
</script>
