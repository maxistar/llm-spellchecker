import { defineEventHandler } from 'h3';
import OpenAI from "openai";
const runtimeConfig = useRuntimeConfig()
const openai = new OpenAI({ apiKey: runtimeConfig.apiSecret });

async function requestLLModel(prompt:string, data:string) {        
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {role: "system", content: prompt},
            {
                role: "user",
                content: data,
            },
        ],
    });

    return completion.choices[0].message;
}

export default defineEventHandler(async (event) => {
    const method = event.req.method;

    if (method !== 'POST') {
        event.res.statusCode = 405;
        return { message: 'HTTP method not allowed' };
    } 

    const body = await readBody(event);
    const { prompt, text } = body;
    
    
    


    return {responce: await requestLLModel(prompt, text)};
});
