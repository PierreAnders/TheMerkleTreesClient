// plugins/web3.js
import Web3 from 'web3';

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const web3 = new Web3(window.ethereum);
    nuxtApp.provide('web3', web3);
  } else {
    console.error('MetaMask n\'est pas installé.');
  }
});
