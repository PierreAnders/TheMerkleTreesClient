<template>
    <div>
        <div class="min-h-screen px-8 pt-8">
            <BurgerMenu />
            <div class="flex items-center justify-center pt-8">
                <h1 class="pr-3 tracking-wider text-light-gray">NOTES</h1>
                <IconNote :color="'#334155'" />
            </div>
            <div class="flex flex-col items-center justify-center mt-10">
                <input
                    class="w-56 w-3/4 h-8 px-4 mb-4 mx-auto text-sm text-white border-2 rounded-md bg-dark-gray placeholder-light-gray border-dark-gray focus:outline-none focus:border-blue"
                    type="text" v-model="note.title" placeholder="Name :">
                <div v-if="editor" class="toolbar">
                    <button @click="editor.chain().focus().toggleBold().run()"
                        :class="{ 'is-active': editor.isActive('bold') }">Gras</button>
                    <button @click="editor.chain().focus().toggleItalic().run()"
                        :class="{ 'is-active': editor.isActive('italic') }">Italique</button>
                    <button @click="editor.chain().focus().toggleStrike().run()"
                        :class="{ 'is-active': editor.isActive('strike') }">Barré</button>
                    <button @click="editor.chain().focus().toggleCode().run()"
                        :class="{ 'is-active': editor.isActive('code') }">Code</button>
                    <button @click="editor.chain().focus().toggleHighlight().run()"
                        :class="{ 'is-active': editor.isActive('highlight') }">Surligner</button>
                    <button @click="setLink">Lien</button>
                    <input type="file" @change="handleImageUpload" accept="image/*" style="display: none;"
                        id="image-upload">
                    <label for="image-upload" class="toolbar-button">Téléverser une image</label>
                    <button @click="editor.chain().focus().toggleTaskList().run()"
                        :class="{ 'is-active': editor.isActive('taskList') }">Liste de tâches</button>
                    <button
                        @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">Tableau</button>
                    <button @click="editor.chain().focus().setTextAlign('left').run()"
                        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }">Gauche</button>
                    <button @click="editor.chain().focus().setTextAlign('center').run()"
                        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }">Centre</button>
                    <button @click="editor.chain().focus().setTextAlign('right').run()"
                        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }">Droite</button>
                    <button @click="editor.chain().focus().setTextAlign('justify').run()"
                        :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }">Justifié</button>
                    <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">Titre 1</button>
                    <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">Titre 2</button>
                    <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">Titre 3</button>
                    <button @click="toggleFullscreen">Plein écran</button>
                </div>

                <div v-if="editor" class="character-count">
                    Nombre de caractères : {{ editor.storage.characterCount.characters() }} / 1000
                </div>

                <div class="editor-container">
                    <editor-content :editor="editor" />
                </div>

                <button class="pt-6 pb-12 text-white" @click="saveContent">
                    <IconSave class="transition-transform transform hover:scale-110" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Code from '@tiptap/extension-code'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import ImageResize from 'tiptap-extension-resize-image'
import Heading from '@tiptap/extension-heading'
import { onMounted, ref } from 'vue'

const note = ref({
    title: '',
    content: '',
})

const editor = useEditor({
    content: process.client ? localStorage.getItem('draftContent') || '' : '',
    extensions: [
        StarterKit,
        Heading.configure({
            levels: [1, 2, 3],
            HTMLAttributes: {
                class: 'font-bold my-4',
            },
        }),
        Placeholder.configure({
            placeholder: 'Commencez à écrire...',
        }),
        Link.configure({
            openOnClick: false,
        }),
        Image,
        ImageResize,
        Code,
        Table.configure({
            resizable: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        TaskList,
        TaskItem,
        Highlight.configure({ color: '#FFC107' }),
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        CharacterCount.configure({
            limit: 1000,
        }),
    ],
    editorProps: {
        handleKeyDown: (view, event) => {
            // Raccourci pour sauvegarder avec Ctrl + S
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault()
                saveContent()
                return true
            }
            return false
        },
    },
})

// Sauvegarde automatique du contenu
onMounted(() => {
    if (process.client) {
        watch(
            () => editor.value?.getHTML(),
            (newContent) => {
                localStorage.setItem('draftContent', newContent)
            },
            { deep: true }
        )
    }
})

// Fonction pour sauvegarder le contenu
const saveContent = () => {
    if (editor.value && process.client) {
        const htmlContent = editor.value.getHTML()
        localStorage.setItem('draftContent', htmlContent)
        console.log('Contenu HTML :', htmlContent)
        alert('Contenu sauvegardé !')
    }
}

// Fonction pour insérer un lien
const setLink = () => {
    const url = prompt('Entrez l\'URL du lien')
    if (url) {
        editor.value.chain().focus().setLink({ href: url }).run()
    }
}

// Fonction pour téléverser une image
const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            editor.value.chain().focus().insertImage({ src: e.target.result }).run()
        }
        reader.readAsDataURL(file)
    }
}

// Fonction pour basculer en mode plein écran
const toggleFullscreen = () => {
    const editorElement = document.querySelector('.ProseMirror')
    if (editorElement.requestFullscreen) {
        editorElement.requestFullscreen()
    } else if (editorElement.webkitRequestFullscreen) { // Pour Safari
        editorElement.webkitRequestFullscreen()
    }
}
</script>

<style>
.toolbar {
    margin-bottom: 10px;
}

.toolbar button,
.toolbar .toolbar-button {
    margin-right: 5px;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
}

.toolbar button.is-active {
    background-color: #ddd;
}

.ProseMirror {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 380px; 
  margin: 0 auto;
  background-color: #f9f9f9;
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  box-sizing: border-box;
}

.editor-container {
  width: 100%;
  max-width: clamp(300px, 90vw, 800px);
  padding: 10px;
}

@media (max-width: 768px) {
  .ProseMirror {
    padding: 10px;
    font-size: 14px;
    min-height: 60vh;
  }
  
  .toolbar button {
    padding: 3px 6px;
    font-size: 12px;
  }
}

.ProseMirror:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.character-count {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
}

.ProseMirror table {
  border-collapse: collapse;
  margin: 1rem 0;
  width: 100%;
}

.ProseMirror td,
.ProseMirror th {
  border: 1px solid #ddd;
  padding: 8px;
  min-width: 50px;
  position: relative;
}

.ProseMirror th {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: left;
}

.column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #007bff;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.ProseMirror table:hover .column-resize-handle {
  opacity: 1;
}
</style>
