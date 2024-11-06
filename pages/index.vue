<template>
   <div class="application">
      <div>
         <div>
            <label>Prompt</label>
         </div>
         <textarea class="prompt-text" v-model="promptText" cols="80" rows="4"></textarea>
      </div>
      <div>
         <div>
            <label>Текст для правки</label>
         </div>

         <textarea class="input-text" v-model="inputText" cols="80" rows="15"></textarea>
      </div>
      <div>
         <div class="process-button-container">
           <label>Choose Model: </label>
           <select v-model="selectedModel">
             <option value="gpt-4">GPT-4</option>
             <option value="gpt-4o">GPT-4o</option>
             <option value="gpt-4-turbo">GPT-4-Turbo</option>
           </select>
           <div class="process-separator"></div>
           <button class="process-button" @click="processText">Обработать</button>
         </div>
         <pre class="output-text" id="result">{{ result }}</pre>
      </div>
   </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';

const promptText = ref('Ты — корректор текстов в онлайн издании, твоя основная задача подготавливать тексты к публикации, поправь пожалуйста грамматические и синтаксические ошибки в предоставленном тексте на русском языке, сам текст, включая структуру предложения и количество предложений оставь, по возможности, без изменений:');
const inputText = ref('');
const selectedModel = ref('gpt-4o');  
const result = ref('');

const processText = async () => {
  result.value = "обработка..." 
    const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: promptText.value,
            text: inputText.value,
            model: selectedModel.value,
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

<style>
body {
  width: 100%;
}

.process-button-container {
  text-align: center;
  padding: 10px 0 0 0;
  display: flex;
  align-items: center;
  
}

.process-separator {
  flex-grow: 1;
}

.process-button {
  padding: 10px;
}

.application {
  width: 80%;
  margin: 10px auto;
}

.prompt-text, .input-text, .output-text {
  width: 100%;
  border: 1px solid gray;
  border-radius: 10px;
  display: block;
}

.output-text {
  height: 200px;
  overflow: auto;
  text-wrap: auto;
}

</style>
