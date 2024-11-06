import { defineEventHandler } from 'h3';
import OpenAI from "openai";
import Client from '@anthropic-ai/sdk';
import { promises as fs } from 'fs';
import path from 'path';
import { diffWords } from 'diff';



const runtimeConfig = useRuntimeConfig()
const openai = new OpenAI({ apiKey: runtimeConfig.apiSecret });
const logDir = path.join(process.cwd(), 'logs');


const anthropic = new Client({
    apiKey: runtimeConfig.claudeApiSecret
});

// Ensure the logs directory exists
async function ensureLogDirectory() {
    try {
        await fs.mkdir(logDir, { recursive: true });
    } catch (err) {
        console.error("Failed to create log directory", err);
    }
}

// Create or append to the daily log file
async function logToFile(model: string, prompt: string, data: string, response: string) {

    // Ensure log directory exists before logging
    await ensureLogDirectory();
    // Get the current date and format it for the filename
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${date}.csv`);

    // Format the current time
    const time = new Date().toISOString().split('T')[1].split('.')[0];

    // Create a CSV row
    const logEntry = `"${time}","${model}","${prompt}","${data}","${response.replace(/\n/g, ' ')}"\n`;

    // Append the log entry to the file
    try {
        await fs.appendFile(logFile, logEntry);
    } catch (err) {
        console.error("Failed to write to log file", err);
    }
}

async function requestOpenAI(prompt:string, data:string, model:string) {        
    const completion = await openai.chat.completions.create({
        model: model,
        messages: [
            {role: "system", content: prompt},
            {
                role: "user",
                content: data,
            },
        ],
    });

    const response = completion.choices[0].message.content as string;
    return response;
}

async function requestClaude(prompt: string, data: string, model:string) {
    const response = await anthropic.messages.create({
        model: model,
        messages: [{ role: 'user', content: `${prompt}\n\n${data}` }],
        max_tokens: 1020,
    });

    console.log(response)
    return response.content[0].text as string;
}

const highlightChanges = (original: string, corrected: string): string => {
    const differences = diffWords(original, corrected);

    return differences
        .map(part => {
            if (part.added) {
                // Wrap added/changed text in a span with a highlight class
                return `<span class="highlight">${part.value}</span>`;
            } else if (part.removed) {
                // Ignore removed text from the original
                return '';
            } else {
                // Unchanged text remains as is
                return part.value;
            }
        })
        .join('');
};

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    if (method !== 'POST') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    } 

    const body = await readBody(event);
    const { prompt, text, model } = body;

    let response;
    if (model === "claude-3-5-sonnet-20241022") {
        response = await requestClaude(prompt, text, model);
    } else {
        response = await requestOpenAI(prompt, text, model);
    }

    await logToFile(model, prompt, text, response);

    const highlightedHtml = highlightChanges(text, response);
    
    return { corrected: response, response: highlightedHtml };
});
