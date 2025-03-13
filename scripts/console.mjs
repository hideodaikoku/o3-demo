// First, install these packages:
// npm install anthropic dotenv

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import Anthropic
import { Anthropic } from '@anthropic-ai/sdk';

// Create the client with the API key from .env file
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // This reads from your .env file
});

// Make a request
const completion = await anthropic.messages.create({
  model: 'claude-3-7-sonnet-20250219',
  max_tokens: 1000,
  messages: [
    { role: 'user', content: '' }
  ],
});

// Log the response
console.log(completion.content[0].text);