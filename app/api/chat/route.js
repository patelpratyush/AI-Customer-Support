import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai'; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
You are an AI coding assistant dedicated to helping users with their programming tasks. Be understanding,
concise, and to the point. When providing code snippets, use Markdown formatting for clarity. Include high-level
comments to explain the code in simple terms, focusing on readability and best practices. If a user provides code,
automatically detect the programming language, check for errors, and suggest improvements. Avoid asking unnecessary
questions unless clarification is needed. Your goal is to assist efficiently and effectively, guiding users towards
optimal solutions. Highlight areas where changes are made with comments for better readability.

Examples:

1. User Query: "Can you help me with this Python code snippet?"
   CodeBuddy Response:
   \`\`\`python
   # Function to calculate factorial
   def factorial(n):
       # Base case
       if n == 0:
           return 1
       # Recursive case
       return n * factorial(n - 1)
   \`\`\`
   Explanation: This function calculates the factorial of a given number \`n\` using recursion. The base case returns \`1\` when \`n\` is \`0\`, and the recursive case multiplies \`n\` by the factorial of \`n-1\`.

2. User Query: "I have this JavaScript code. Can you check for errors?"
   CodeBuddy Response:
   \`\`\`javascript
   // Function to check if a number is even
   function isEven(num) {
       return num % 2 === 0;
   }
   \`\`\`
   Explanation: This function checks if a number is even by using the modulus operator. It returns \`true\` if the number is divisible by \`2\`, and \`false\` otherwise.

3. User Query: "Can you optimize this SQL query?"
   CodeBuddy Response:
   \`\`\`sql
   -- Original query
   SELECT * FROM users WHERE status = 'active';

   -- Optimized query
   SELECT id, name, email FROM users WHERE status = 'active';
   \`\`\`
   Explanation: The optimized query retrieves only the necessary columns (\`id\`, \`name\`, \`email\`) instead of selecting all columns with \`*\`, which can improve performance.

If the user provides code, automatically detect the language and check for errors and improvements based on the code snippet. Do not ask too many questions unless necessary for clarification.
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

// // POST function to handle incoming requests
// export async function POST(req) {
//   const {messages , model} = await req.json(); // Parse the JSON body of the incoming request

//   // Create a chat completion request to the OpenAI API via OpenRouter
//   const completion = await openai.chat.completions.create({
//     model: model || "meta-llama/llama-3.1-8b-instruct:free", // Specify the model to use
//     messages: [{ role: 'system', content: systemPrompt }, ...messages], // Include the system prompt and user messages
//     stream: true, // Enable streaming responses
//   });

//   // Create a ReadableStream to handle the streaming response
//   const stream = new ReadableStream({
//     async start(controller) {
//       const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
//       try {
//         // Iterate over the streamed chunks of the response
//         for await (const chunk of completion) {
//           const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
//           if (content) {
//             const text = encoder.encode(content); // Encode the content to Uint8Array
//             controller.enqueue(text); // Enqueue the encoded text to the stream
//           }
//         }
//       } catch (err) {
//         controller.error(err); // Handle any errors that occur during streaming
//       } finally {
//         controller.close(); // Close the stream when done
//       }
//     },
//   });

//   return new NextResponse(stream); // Return the stream as the response
// }

// export async function POST(req) {
//   const formData = await req.formData();
//   const message = formData.get('message');
//   const model = formData.get('model') || 'qwen/qwen-2-7b-instruct:free';
  
//   // Create a new FormData object to send to the Python API
//   const apiFormData = new FormData();
//   apiFormData.append('message', message);
//   apiFormData.append('model', model);

//   // Append files and links
//   for (let [key, value] of formData.entries()) {
//     if (key.startsWith('file') || key.startsWith('link')) {
//       apiFormData.append(key, value);
//     }
//   }

//   const response = await fetch('http://localhost:5000/api/chat', {
//     method: 'POST',
//     body: apiFormData,
//   });

//   if (!response.ok) {
//     throw new Error('API request failed');
//   }

//   return new NextResponse(response.body);
// }

export async function POST(req) {
  const data = await req.json();

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pinecone-API-Key': process.env.PINECONE_API_KEY,
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return new NextResponse(response.body);
  } catch (error) {
    console.error('Error in API call:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}