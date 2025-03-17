<template>
    <div class="min-h-screen px-8 pt-8">
        <BurgerMenu />
        <div class="flex items-center justify-center pt-8">
            <h1 class="pr-3 tracking-wider text-light-gray">NOTES</h1>
            <IconNote :color="'#334155'" />
        </div>
        <div class="flex flex-col items-center justify-center mt-10">
            <input
                class="w-56 w-3/4 h-8 px-4 mx-auto text-sm text-white border-2 rounded-md bg-dark-gray placeholder-light-gray border-dark-gray focus:outline-none focus:border-blue"
                type="text" v-model="note.title" placeholder="Name :">
            <div id="app" class="mx-auto mt-6 md:w-10/12">
                <editor :api-key="TINYMCE_API_KEY" ref="myEditor" :init="initOptions" v-model="textContent" />
            </div>
            <button class="pt-6 pb-12 text-white" @click="getHtmlFromEditor">
                <IconSave class="transition-transform transform hover:scale-110" />
            </button>
        </div>
    </div>
</template>
 
<script>
import axios from 'axios'
import Editor from '@tinymce/tinymce-vue'
import { ref, watchEffect } from 'vue'
import { useTextContentStore } from '../textContentStore'
const apiKey = import.meta.env.VITE_TINYMCE_API_KEY
const BASE_URL = import.meta.env.VITE_BASE_URL

export default {
    name: 'app',
    components: {
        'editor': Editor
    },
    data() {
        return {
            textContent: '',
            note: {
                title: '',
                content: ''
            },
            TINYMCE_API_KEY: apiKey,
            initOptions: {
                height: 600,
                menubar: true,
                plugins: [
                    'advlist', 'autolink',
                    'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
                    'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                skin: "oxide-dark",
                content_css: "dark",
                toolbar:
                    'undo redo | casechange blocks | bold italic backcolor | \
                                                                alignleft aligncenter alignright alignjustify | \
                                                                bullist numlst checklist outdent indent | removeformat | a11ycheck code table help'
            }
            // Avec Full Options
            // initOptions: {
            //     height: 600,
            //     menubar: true,
            //     plugins: [
            //         'a11ychecker', 'advlist', 'advcode', 'advtable', 'autolink', 'checklist', 'export',
            //         'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
            //         'powerpaste', 'fullscreen', 'formatpainter', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
            //     ],
            //     toolbar:
            //         'undo redo | casechange blocks | bold italic backcolor | \
            //                                                     alignleft aligncenter alignright alignjustify | \
            //                                                     bullist numlst checklist outdent indent | removeformat | a11ycheck code table help'
            // }
        }
    },
    setup() {
        const textContentStore = useTextContentStore();
        const textContent = ref(textContentStore.textContent);
        const note = ref({ title: '', content: '' });

        watchEffect(() => {
            textContent.value = textContentStore.textContent;
            note.value.title = textContentStore.fileNameWithoutExtension;
        });

        return {
            textContent,
            note,
        };
    },

    methods: {

        getHtmlFromEditor() {
            this.note.content = this.textContent;
            this.sendNoteInfo();
            this.$router.push('/folders/Notes')
        },

        async sendNoteInfo() {
            try {
                const token = localStorage.getItem("access_token");

                if (!token) {
                    console.error("Jeton JWT non trouvé.");
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const response = await axios.post(`${BASE_URL}/notes`, this.note, { headers });

                if (response.status === 200) {
                    console.log("Enregistrement d'une nouvelle note'.")
                } else {
                    console.error("Échec de l'enregistrement d'une nouvelle note.");
                }
            } catch (error) {
                console.error("Erreur lors de la soumission d'une nouvelle note:", error);
            }
        },
    },
}
</script>