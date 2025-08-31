# How to Implement Claude 4 Sonnet

import anthropic

client \= anthropic.Anthropic(api\_key="YOUR\_ANTHROPIC\_API\_KEY")

system\_prompt \= """  
You are an expert n8n workflow automation designer and JSON generator.  
CRITICAL INSTRUCTIONS FOR JSON OUTPUT:  
1\. You MUST respond with valid JSON only — no explanations, comments, or text  
2\. The JSON must conform exactly to n8n's workflow export format  
3\. Use double quotes throughout and proper syntax  
4\. All IDs must be unique UUIDs, timestamps in ISO 8601  
5\. Node types must use canonical n8n strings (e.g., "n8n-nodes-base.manualTrigger")  
Root fields: name, nodes, connections, active, settings, versionId, id, createdAt, updatedAt  
"""

user\_prompt \= """  
Draft an n8n workflow in JSON that:  
1\. Starts with a webhook trigger  
2\. Makes an HTTP request to a REST API  
3\. Processes the response with a Set node  
4\. Sends the processed data via email  
"""

response \= client.messages.create(  
    model="claude-sonnet-4-20250514",  
    max\_tokens=64000,  
    system=system\_prompt,  
    messages=\[{"role": "user", "content": user\_prompt}\],  
    temperature=0.1  
)

print(response.content\[0\].text)

# How the Voice Assistant Icon Was Implemented

**\# Voice Transcription Implementation Blueprint**

**\#\# Required State Variables**

\`\`\`typescript  
const \[input, setInput\] \= useState("");  
const \[isRecording, setIsRecording\] \= useState(false);  
const \[recognition, setRecognition\] \= useState\<any\>(null);  
const inputRef \= useRef(input);  
const initialInputRef \= useRef("");

// Sync ref with state  
useEffect(() \=\> {  
 inputRef.current \= input;  
}, \[input\]);  
\`\`\`

**\#\# Main Voice Handler Function**

\`\`\`typescript  
const startVoiceInput \= () \=\> {  
 // STOP RECORDING AND AUTO-SEND LOGIC  
 if (isRecording && recognition) {  
   recognition.stop();  
   setIsRecording(false);  
   setRecognition(null);  
    
   // Use ref to get current value and send after a short delay  
   setTimeout(() \=\> {  
     const currentInput \= inputRef.current;  
     console.log('Stopping recording. Current input:', currentInput);  
     if (currentInput.trim()) {  
       onSend(currentInput.trim());  // AUTO-SEND THE MESSAGE  
       setInput("");  // Clear the input after sending  
     }  
   }, 200);  // 200ms delay ensures recognition has finished processing  
   return;  
 }

 // START RECORDING LOGIC  
 // Check for Web Speech API support  
 if (\!('webkitSpeechRecognition' in window) && \!('SpeechRecognition' in window)) {  
   alert("Voice input is not supported in your browser. Please try Chrome or Edge.");  
   return;  
 }

 const SpeechRecognition \= (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;  
 const recognitionInstance \= new SpeechRecognition();  
  // CRITICAL CONFIGURATION FOR REAL-TIME TRANSCRIPTION  
 recognitionInstance.continuous \= true;  // Keep recording until manually stopped  
 recognitionInstance.interimResults \= true;  // Get partial results while speaking  
 recognitionInstance.lang \= 'en-US';  
 recognitionInstance.maxAlternatives \= 1;  
  // Recording started handler  
 recognitionInstance.onstart \= () \=\> {  
   setIsRecording(true);  
   setRecognition(recognitionInstance);  
   initialInputRef.current \= input; // Preserve any existing text  
   console.log('Voice recognition started \- Speak now\!');  
 };  
  // REAL-TIME TRANSCRIPTION HANDLER \- This is the key part\!  
 recognitionInstance.onresult \= (event: any) \=\> {  
   let finalTranscript \= '';  
   let interimTranscript \= '';  
    
   // Process ALL results to build complete transcript  
   for (let i \= 0; i \< event.results.length; i\++) {  
     const transcript \= event.results\[i\]\[0\].transcript;  
     if (event.results\[i\].isFinal) {  
       finalTranscript \+= transcript \+ ' ';  
     } else {  
       interimTranscript \+= transcript;  
     }  
   }  
    
   // Combine initial text \+ final results \+ interim results  
   const combinedInput \= initialInputRef.current \+ finalTranscript \+ interimTranscript;  
   setInput(combinedInput);  // Updates textarea in real-time  
 };  
  // Error handling  
 recognitionInstance.onerror \= (event: any) \=\> {  
   console.error('Speech recognition error:', event.error);  
   setIsRecording(false);  
   setRecognition(null);  
    
   if (event.error \=== 'not-allowed') {  
     alert("Please allow microphone access to use voice input.");  
   } else if (event.error \=== 'no-speech') {  
     console.log("No speech detected");  
   } else if (event.error \!== 'aborted') {  
     alert(\`Voice input error: ${event.error}\`);  
   }  
 };  
  // Cleanup when recognition ends  
 recognitionInstance.onend \= () \=\> {  
   setIsRecording(false);  
   setRecognition(null);  
   console.log('Voice recognition ended');  
 };  
  // Start recognition  
 try {  
   recognitionInstance.start();  
 } catch (error) {  
   console.error('Failed to start recognition:', error);  
   setIsRecording(false);  
   alert("Failed to start voice recognition. Please try again.");  
 }  
};  
\`\`\`

**\#\# UI Components**

**\#\#\# Voice Button**

\`\`\`tsx  
\<div className\="relative"\>  
 \<Button  
   variant\="ghost"  
   size\="icon"  
   onClick\={startVoiceInput}  
   title\={isRecording ? "Recording... Click again to stop and send" : "Click to start voice input"}  
   className\={\`h-14 w-14 transition-all duration-200 ${  
     isRecording  
       ? 'bg-destructive text-white hover:bg-destructive/90 animate-pulse'  
       : 'text-muted-foreground hover:text-accent hover:bg-accent/10'  
   }\`}  
   disabled\={disabled}  
 \>  
   \<Mic className\={\`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}\`} /\>  
 \</Button\>  
  {/\* Recording indicator tooltip \*/}  
 {isRecording && (  
   \<div className\="absolute \-top-8 left-1/2 \-translate-x-1/2 bg-destructive text-white text-xs px-2 py-1 rounded-md whitespace-nowrap animate-pulse"\>  
     🔴 Recording... Click to stop & send  
   \</div\>  
 )}  
\</div\>  
\`\`\`

**\#\#\# Textarea with Real-time Updates**

\`\`\`tsx  
\<Textarea  
 value\={input}  
 onChange\={handleInputChange}  
 onKeyPress\={handleKeyPress}  
 placeholder\={isRecording ? "🎤 Listening... Speak now\!" : "Your default placeholder..."}  
 className\={\`min-h-\[56px\] resize-none border-2 transition-all duration-200 ${  
   isRecording  
     ? 'border-destructive/50 bg-destructive/5 animate-pulse'  
     : 'border-border/50 bg-background/50'  
 }\`}  
 disabled\={disabled}  
/\>  
\`\`\`

**\#\# Critical Implementation Details**

**\#\#\# Web Speech API Configuration**  
\`\`\`typescript  
recognitionInstance.continuous \= true;       // Must be true for continuous recording  
recognitionInstance.interimResults \= true;   // Must be true for real-time display  
recognitionInstance.lang \= 'en-US';  
recognitionInstance.maxAlternatives \= 1;  
\`\`\`

**\#\#\# Real-time Transcription Processing**  
\`\`\`typescript  
recognitionInstance.onresult \= (event: any) \=\> {  
 let finalTranscript \= '';  
 let interimTranscript \= '';  
  // Process ALL results from index 0  
 for (let i \= 0; i \< event.results.length; i\++) {i  
   const transcript \= event.results\[i\]\[0\].transcrpt;  
   if (event.results\[i\].isFinal) {  
     finalTranscript \+= transcript \+ ' ';  
   } else {  
     interimTranscript \+= transcript;  
   }  
 }  
  // Combine: initial text \+ final \+ interim  
 const combinedInput \= initialInputRef.current \+ finalTranscript \+ interimTranscript;  
 setInput(combinedInput);  
};  
\`\`\`

**\#\#\# Auto-send Mechanism**  
\`\`\`typescript  
// In the stop recording section:  
setTimeout(() \=\> {  
 const currentInput \= inputRef.current;  // Use ref to get latest value  
 if (currentInput.trim()) {  
   onSend(currentInput.trim());          // Auto-send  
   setInput("");                         // Clear input  
 }  
}, 200);  // 200ms delay ensures all transcription is processed  
\`\`\`

**\#\# Complete Working Example**

\`\`\`typescript  
import { useState, useRef, useEffect } from "react";  
import { Mic } from "lucide-react";

function VoiceTranscriptionComponent({ onSend }) {  
 const \[input, setInput\] \= useState("");  
 const \[isRecording, setIsRecording\] \= useState(false);  
 const \[recognition, setRecognition\] \= useState(null);  
 const inputRef \= useRef(input);  
 const initialInputRef \= useRef("");

 useEffect(() \=\> {  
   inputRef.current \= input;  
 }, \[input\]);

 const startVoiceInput \= () \=\> {  
   if (isRecording && recognition) {  
     // Stop and send  
     recognition.stop();  
     setIsRecording(false);  
     setRecognition(null);  
      
     setTimeout(() \=\> {  
       const currentInput \= inputRef.current;  
       if (currentInput.trim()) {  
         onSend(currentInput.trim());  
         setInput("");  
       }  
     }, 200);  
     return;  
   }

   // Start recording  
   const SpeechRecognition \= window.SpeechRecognition || window.webkitSpeechRecognition;  
   const recognitionInstance \= new SpeechRecognition();  
    
   recognitionInstance.continuous \= true;  
   recognitionInstance.interimResults \= true;  
   recognitionInstance.lang \= 'en-US';  
    
   recognitionInstance.onstart \= () \=\> {  
     setIsRecording(true);  
     setRecognition(recognitionInstance);  
     initialInputRef.current \= input;  
   };  
    
   recognitionInstance.onresult \= (event) \=\> {  
     let finalTranscript \= '';  
     let interimTranscript \= '';  
      
     for (let i \= 0; i \< event.results.length; i\++) {  
       const transcript \= event.results\[i\]\[0\].transcript;  
       if (event.results\[i\].isFinal) {  
         finalTranscript \+= transcript \+ ' ';  
       } else {  
         interimTranscript \+= transcript;  
       }  
     }  
      
     const combinedInput \= initialInputRef.current \+ finalTranscript \+ interimTranscript;  
     setInput(combinedInput);  
   };  
    
   recognitionInstance.onerror \= (event) \=\> {  
     setIsRecording(false);  
     setRecognition(null);  
   };  
    
   recognitionInstance.onend \= () \=\> {  
     setIsRecording(false);  
     setRecognition(null);  
   };  
    
   recognitionInstance.start();  
 };

 return (  
   \<div className\="flex gap-3"\>  
     \<textarea  
       value\={input}  
       onChange\={(e) \=\> setInput(e.target.value)}  
       placeholder\={isRecording ? "🎤 Listening..." : "Type a message..."}  
       className\={isRecording ? 'recording-active' : ''}  
     /\>  
     \<button  
       onClick\={startVoiceInput}  
       className\={isRecording ? 'mic-recording' : 'mic-idle'}  
     \>  
       \<Mic /\>  
     \</button\>  
   \</div\>  
 );  
}  
\`\`\`

