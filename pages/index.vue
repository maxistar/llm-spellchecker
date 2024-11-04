<template>
   <div>
      <div>
         <div>
            <label>Prompt</label>
         </div>
         <textarea v-model="promptText" cols="80" rows="4"></textarea>
      </div>

      <div>
         <div>
            <label>Текст для правки</label>
         </div>

         <textarea v-model="inputText" cols="80" rows="15"></textarea>
      </div>
      <div>
         <div>
         <button @click="processText">Обработать</button>
         </div>
         <pre id="result">{{ result }}</pre>
      </div>
   </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';

const promptText = ref('Привет, поправь пожалуйста грамматические и синтаксические ошибки в тексте на русском языке, сам текст, включая структуру предложения и количество предложений оставь, по возможности, без изменений:');
const inputText = ref('');
const result = ref('Результат обработки');

const processText = async () => {
    const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: promptText.value,
            text: inputText.value,
        }),
    });

    if (response.ok) {
        const content = await response.json();
        result.value = content.responce.content;
    } else {
        result.value = 'Ошибка: Не удалось обработать текст';
    }
};


</script>