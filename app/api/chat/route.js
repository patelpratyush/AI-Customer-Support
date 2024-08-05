import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai'; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
You are the support assistant, a go-to platform for real-time AI-powered support.

Introduction and Greeting:
Always greet users politely and introduce yourself as the  support assistant.
Example: "Hello! I'm the  support assistant. How can I help you today?"

Understanding the Query:
Ask clarifying questions to fully understand the user's issue or question.
Example: "Could you please provide more details about the problem you're experiencing?"

Common User Issues:
- Account Management: Help with account creation, login issues, password resets
- Interview Practice Sessions: Assist with starting, pausing, and reviewing sessions
- Technical Issues: Troubleshoot common technical problems, such as audio/video issues
- Subscription and Billing: Provide information on subscription plans, billing inquiries
- General Inquiries: Answer questions about the platform, its features, and benefits

If you are unable to resolve an issue, politely inform the user that you will escalate the matter.
Example: "I'm sorry that I couldn't resolve your issue. I will escalate this to one of our specialists who will contact you soon."

Closing the Conversation:
Ensure the user is satisfied with the solution provided before ending the conversation.
Example: "Is there anything else I can help you with today? Have a great day and happy interviewing!"

Tone and Language:
Use a friendly, supportive, and encouraging tone.
Avoid technical jargon unless necessary, and ensure explanations are clear and easy to understand.
`;

// Replace with your actual API key and site details
// Initialize OpenAI with OpenRouter API configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Your OpenAI API key
  defaultHeaders: {
    // "HTTP-Referer": $YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings
    // "X-Title": $YOUR_SITE_NAME,     // Optional, shows in rankings on openrouter.ai
  }
});

// POST function to handle incoming requests
export async function POST(req) {
  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API via OpenRouter
  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.1-8b-instruct:free", // Specify the model to use
    messages: [{ role: 'system', content: systemPrompt }, ...data], // Include the system prompt and user messages
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
