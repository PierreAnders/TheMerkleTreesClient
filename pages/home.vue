<template>
    <div class="min-h-screen px-8 pt-8 pb-16">
        <BurgerMenu />
        <div class="flex items-center justify-center pt-8">
            <h1 class="pr-3 tracking-wider text-light-gray">HOME</h1>
            <IconHome :color="'#334155'" class="mr-2" />
        </div>
        <Datetime class="pt-12"/>
        <div class="flex justify-between mt-12">
            <div class="flex-grow">
                <!-- Contenu principal -->
            </div>
            <div class="flex flex-col items-center mr-8">
                <div v-for="shortcut in shortcuts" :key="shortcut.url" class="mb-4">
                    <Shortcut :url="shortcut.url" :title="shortcut.title" />
                </div>
                <form @submit.prevent="addShortcut" class="flex flex-col items-center">
                    <div>
                        <IconAddFolder class="transition-transform transform cursor-pointer h-12 w-12 mt-4 hover:scale-105"
                            id="button-add-folder" @click="isButtonClicked = !isButtonClicked" v-show="!isButtonClicked" />
                    </div>
                    <div id="icon-add-folder" v-show="isButtonClicked">
                        <div class="flex flex-col items-center">
                            <input v-model="newShortcutUrl" placeholder="URL"
                                class="flex w-48 h-8 px-4 mr-2 mb-2 text-sm text-white border-2 rounded-md placeholder-light-gray bg-dark-gray border-dark-gray focus:outline-none focus:border-blue" required />
                            <input v-model="newShortcutTitle" placeholder="Title"
                                class="flex w-48 h-8 px-4 mr-2 text-sm text-white border-2 rounded-md placeholder-light-gray bg-dark-gray border-dark-gray focus:outline-none focus:border-blue" required />
                            <button class="pt-2 transition-transform transform hover:scale-110" type="submit">
                                <IconSubmenuAddFolder />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import Shortcut from '~/components/Shortcut.vue';
import Datetime from '~/components/Datetime.vue';
import IconAddFolder from '~/components/IconAddFolder.vue';
import IconSubmenuAddFolder from '~/components/IconSubmenuAddFolder.vue';

export default {
    components: {
        Shortcut,
        Datetime,
        IconAddFolder,
        IconSubmenuAddFolder
    },
    data() {
        return {
            shortcuts: [
                { url: 'https://www.google.com', title: 'Google' },
                { url: 'https://www.youtube.com', title: 'YouTube' },
                { url: 'https://www.facebook.com', title: 'Facebook' },
                // { url: 'https://www.twitter.com', title: 'Twitter' }
            ],
            newShortcutUrl: '',
            newShortcutTitle: '',
            isButtonClicked: false
        };
    },
    methods: {
        addShortcut() {
            this.shortcuts.push({
                url: this.newShortcutUrl,
                title: this.newShortcutTitle
            });
            this.newShortcutUrl = '';
            this.newShortcutTitle = '';
            this.isButtonClicked = false;
        }
    }
};
</script>