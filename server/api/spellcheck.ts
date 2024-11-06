import { defineEventHandler } from 'h3';
import OpenAI from "openai";
import { promises as fs } from 'fs';
import path from 'path';



const runtimeConfig = useRuntimeConfig()
const openai = new OpenAI({ apiKey: runtimeConfig.apiSecret });
const logDir = path.join(process.cwd(), 'logs');

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

async function requestLLModel(prompt:string, data:string, model:string) {        
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
    
    await logToFile(model, prompt, data, response);
    
    return response;
}

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    if (method !== 'POST') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    } 

    const body = await readBody(event);
    const { prompt, text, model } = body;

    return {responce: await requestLLModel(prompt, text, model)};
});
