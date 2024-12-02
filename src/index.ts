import { Hono } from 'hono'
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: CloudflareBindings }>()


app.use(cors());


// Conversational endpoint
app.post('/conversation', async (c) => {
  try {

    const { prompt } = await c.req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Missing required field: prompt' });
    }
    
    const result = await c.env.AI.run('@cf/google/gemma-7b-it-lora', {
      prompt: prompt,
    });
    
    
    return Response.json(result.response );
    
  } catch (error) {
    
    console.error(error);
    return Response.json({ error: 'An unexpected error occurred' });
  }
});



// Code generation endpoint
app.post('/code', async (c) => {

  try{
  const { prompt } = await c.req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Missing required field: prompt' });
    }
    
    const result = await c.env.AI.run('@hf/thebloke/deepseek-coder-6.7b-instruct-awq', {
      prompt: prompt,
    });
    
    return Response.json(result.response );
    
  } catch (error) {
    
    console.error(error);
    return Response.json({ error: 'An unexpected error occurred' });
  }

});


// Image generation endpoint
app.post('/image', async (c) => {
  try {

    const { prompt  } = await c.req.json();

    if (!prompt) {
      return c.json({ error: 'Missing required field: prompt' }, 400);
    }

    const result = await c.env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt ,
    });


    const dataURI = `data:image/png;base64,${result.image}`;
    return Response.json( {dataURI});
    
  } catch (error) {

    console.error(error);
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});



// Translation endpoint
app.post('/translate', async (c) => {
  try {
    const { text, sourceLang, targetLang } = await c.req.json();
    if (!text || !sourceLang || !targetLang) {
      return c.json({ error: 'Missing required fields: text, sourceLang, or targetLang' }, 400);
    }
    const result = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
      text: text,
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    return c.json( result , 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});






// Summarization endpoint
app.post('/summarize', async (c) => {
  try {
    const { text } = await c.req.json();
    if (!text) {
      return c.json({ error: 'Missing required field: text' }, 400);
    }
    const result = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
      input_text: text,
    });
    console.log(result.summary)
    return c.json({ summary: result.summary }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

export default app;
