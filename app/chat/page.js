'use client'

import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  TextField,
  Stack,
  Grow,
  Menu,
  MenuItem,
} from '@mui/material';
import { AccountCircle, Logout, Send } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // GitHub dark theme for code highlighting
import { useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from '@/firebase';
import { Analytics } from "@vercel/analytics/react";
import withAuth from '../protectedRoute';


const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! I'm your coding companion. How can I assist you with your code today?",
    },
  ])
  // State to store the current message input by the user
  const [message, setMessage] = useState('');
  // State to indicate whether a message is being processed
  const [isLoading, setIsLoading] = useState(false);
  // State to track if the input should be at the bottom of the screen
  const [inputAtBottom, setInputAtBottom] = useState(false);
  const inputRef = useRef(null);
  // For dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  // State to hold user email
  const [userEmail, setUserEmail] = useState('');
  // State to hold user UID
  const [userUid, setUserUid] = useState('');
  const [loading, setLoading] = useState(false);
  // Initialize router
  const router = useRouter();

  const userandplaceholdermsg = (message, setMessages) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
  };

    // Handles the server response stream and updates the assistant's message.
    const handleServerResponse = async (reader, decoder, setMessages) => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // Exit the loop if the stream is finished
  
        // Decode the chunk and update the assistant's message content
        const text = decoder.decode(value, { stream: true });
        updateLastMessage(text, setMessages);
      }
    };
  
    // Updates the content of the last message in the messages array.
    const updateLastMessage = (text, setMessages) => {
      setMessages((prevMessages) => {
        let lastMessage = prevMessages[prevMessages.length - 1];
        let otherMessages = prevMessages.slice(0, prevMessages.length - 1);
  
        // Append the new text to the last message content
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ];
      });
    };

    // Handles any errors that occur during the fetch request.
  const handleError = (setMessages) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: 'assistant',
        content: "I'm sorry, but I encountered an error. Please try again later.",
      },
    ]);
  };

  // Sends the user's message to the server and processes the response.
  const sendMessage = async () => {
    // Prevent sending empty messages or if already loading
    if (!message.trim() || isLoading) return;
    setIsLoading(true); // Set loading state to true

    // Add user message and a placeholder for the assistant's response
    userandplaceholdermsg(message, setMessages);
    setMessage(''); // Clear the input field

    try {
      // Send the user message to the server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      // Check if the network response is OK
      if (!response.ok) throw new Error('Network response was not ok');

      // Read and decode the stream of data from the server
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Process the server response stream
      await handleServerResponse(reader, decoder, setMessages);
    } catch (error) {
      console.error('Error:', error);

      // Handle any errors by displaying an error message
      handleError(setMessages);
    }

    setIsLoading(false); // Reset loading state to false
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      setInputAtBottom(true)
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget); // Set the anchor element to the current target (menu button)
  };

  // Closes the profile menu by clearing the anchor element.
  const handleMenuClose = () => {
    setAnchorEl(null); // Clear the anchor element, closing the menu
  };

  // Signs the user out and redirects to the landing page.
  const handleSignOut = async () => {
    await signOut(auth); // Perform sign out using the authentication service
    router.push('/'); // Redirect the user to the landing page after signing out
  };

  // Get Users Email and ID
  useEffect(() => {
    // Fetch the current user's email and UID
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserUid(user.uid);
      } else {
        setUserEmail('');
        setUserUid('');
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    // Main container with dark background
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#121212', color: 'white' }}>
      {/* App bar with bot icon and sign out button */}
      <AppBar position="static" elevation={0} style={{ backgroundColor: '#121212', color: 'white' }}>
        <Toolbar>
          {/* <IconButton edge="start" color="inherit" aria-label="bot-icon"> */}
          {/*   <BotIcon /> */}

          <Typography variant="h6" style={{ flexGrow: 1, marginLeft: 10 }}>
            AI Assistant
          </Typography>

          {/* Profile Icon */}
          <IconButton onClick={handleMenuOpen} sx={{ marginLeft: 'auto' }}>
            <AccountCircle fontSize="large" sx={{ color: '#afafaf' }} />
          </IconButton>
          {/* Drop down Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: '#1e1e1e', // Change this to your desired color
                color: 'white', // Optional: text color
              },
            }}
          >
            <MenuItem >
              <Typography variant="body2">{userEmail}</Typography>
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <Logout fontSize="small" />
              <Typography variant="body2" sx={{ marginLeft: 1 }}>Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main content area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '55px' }}>
        {!inputAtBottom ? (
          // Initial state: Landing page with welcome message and input box
          <Container maxWidth="md" style={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom align="center" style={{ color: 'white' }} mt="15vh">
              Coding Help with AI
            </Typography>
            {/* <Typography variant="h5" paragraph align="center" style={{ color: '#b0b0b0' }}>
              Our AI-powered assistant is here to help you with all your customer service needs. Get instant answers and personalized support.
            </Typography> */}
            <Box mt={4} display="flex" justifyContent="center">
              <TextField
                variant="outlined"
                autoComplete="off"
                placeholder="Ask me anything..."
                value={message}

                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <IconButton>
                      <Send style={{ color: 'white' }} />
                    </IconButton>
                  ),
                }}
                fullWidth
                sx={{
                  backgroundColor: '#333',
                  color: 'white',
                  borderRadius: '50px',
                  width: '600px', // Set a fixed width

                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',

                    '& fieldset': {
                      borderColor: '#555',
                    },
                    '&:hover fieldset': {
                      borderColor: '#777',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#aaa',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'white',
                  },
                }}
                ref={inputRef}
              />
            </Box>
          </Container>
        ) : (
          // Chat state: Messages list and input at bottom
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                maxWidth: 'md',
                margin: '0 auto',
                padding: 2,
                overflowY: 'auto',
                height: 'calc(100vh - 120px)', // Adjust height to fit messages container
                '&::-webkit-scrollbar': {
                  width: '8px',
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'transparent',
                  borderRadius: '10px',
                  transition: 'background 5s ease', /* Add transition effect */
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Stack direction="column" spacing={2}>
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      maxWidth: '80%',
                      borderRadius: '20px',
                      padding: 2,
                      marginBottom: 1,
                      color: 'white',
                      backgroundColor: msg.role === 'assistant' ? '#333' : '#1e1e1e',
                      alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                      overflowWrap: 'break-word',
                      lineHeight: '1.5', // Increased line-height for better readability
                      // Markdown specific styles
                      '& p': {
                        marginBottom: '0px', // Space between paragraphs
                      },
                      '& ul, & ol': {
                        marginLeft: '2em', // Space before list items
                      },
                      '& code': {
                        backgroundColor: 'rgba(100,100,100,0.1)', // Change this to update background color of code blocks
                        padding: '0.2em 0.4em',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        // border: 1px solid ${currentTheme.palette.divider},
                      },
                      '& pre': {
                        padding: '1em',
                        borderRadius: '4px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '0.5em',
                        // border: 1px solid ${currentTheme.palette.divider},
                      }
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </Box>
                ))}
                {/* Reference to scroll to the bottom */}
                <div ref={messagesEndRef} />
              </Stack>
            </Box>

            {/* Input box at the bottom */}
            <Grow in={inputAtBottom} timeout={500}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 2,
                  width: '100%', // Ensure the box stretches across the full width
                  transition: 'transform 0.5s ease-in-out', // Use transform for smoother transition
                  transform: inputAtBottom ? 'translateY(0)' : 'translateY(100%)', // Apply the transform for smooth movement
                  zIndex: 1,
                  backgroundColor: '#121212',
                }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Ask me anything..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={sendMessage} disabled={isLoading}>
                        <Send style={{ color: '#121212' }} />
                      </IconButton>
                    ),
                  }}
                  fullWidth
                  sx={{
                    backgroundColor: '#333',
                    color: 'white',
                    borderRadius: '50px',
                    width: '600px', // Set a fixed width
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '50px',
                      '& fieldset': {
                        borderColor: '#555',
                      },
                      '&:hover fieldset': {
                        borderColor: '#777',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#aaa',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    },
                  }}
                  ref={inputRef}
                />
              </Box>
            </Grow>
          </Box>
        )}
      </main>
      <Analytics />
    </div>
  );
};

export default withAuth(ChatPage);