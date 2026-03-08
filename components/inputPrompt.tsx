"use client"

import { useEffect, useState } from "react";
import puter from "@heyputer/puter.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function InputPrompt() {
  const [aiResponse, setAiResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    // Initialize Puter only in browser environment
    const initPuter = async () => {
      if (typeof window !== 'undefined' && puter.ai) {
        try {
          console.log("Puter AI is ready");
        } catch (error) {
          console.warn("Puter initialization error:", error);
        }
      }
    };
    initPuter();
  }, []);

  const handleAiChat = async () => {
    setLoading(true);
    setAiResponse("");
    
    try {
      // Check if Puter is available
      if (!puter.ai) {
        throw new Error("Puter AI is not available. Please ensure you're logged into Puter.");
      }
      
      const COURSE_SYSTEM_PROMPT = `
        You are an Elite Course Architect. You specialize in breaking down complex technical topics into easy-to-digest lessons.
        
        ### OUTPUT STRUCTURE
        If the user asks for a course, provide:
        1. A Course Title (#)
        2. A Syllabus (##) with numbered modules.
        3. A detailed "Lesson 1" to get them started.
        `;

      // Use the puter.ai.chat function to get a streaming response
      const response = await puter.ai.chat(prompt, { model: "gpt-4o", stream: true, system: COURSE_SYSTEM_PROMPT });
      
      let result = '';
      
      // Handle the response as AsyncIterable<ChatResponseChunk>
      for await (const part of response) {
        // Extract the text content from the chunk
        if (part?.text) {
          result += part.text;
          setAiResponse(result);
        }
      }
    } catch (error) {
      console.error("AI request failed:", error);
      let errorMessage = "Error: Unable to get AI response.";
      
      if (error instanceof Error) {
        if (error.message.includes('unref')) {
          errorMessage = "Error: Stream connection issue. Please try again.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setAiResponse(errorMessage);
    } finally {
      setLoading(false);
    }
  };
    const preprocessMarkdown = (src: string) => {
    return src
        // 1. Convert [ \math ] to $$ \math $$ (Block math)
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$') 
        // 2. Convert ( \math ) to $ \math $ (Inline math)
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')
        // 3. Handle cases where the AI might have stripped the backslashes (common in some Puter models)
        .replace(/\[\s*(\\int|\\frac|\\sum|\\sqrt|\\left)([\s\S]*?)\]/g, '$$$$$1$2$$$$')
        .replace(/\(\s*([a-z]\(x\)\s*=|\\int|\\frac)([\s\S]*?)\)/g, '$$$1$2$$');
    };


    const cleanMathAI = (text: string) => {
    return text
        // 1. Fix the "delimiters inside commands" hallucination
        // Changes \left$$\frac... to $$\left(\frac...
        .replace(/\\left\$\$/g, '$$\\left(')
        
        // 2. Fix the closing side and move subscripts outside
        // Changes \right$$_0^1 to \right)_0^1 $$
        .replace(/\\right\$\$(\s*[_^]{1,2}\{[^}]+\}|[_^][a-z0-9])?/g, (match, subSup) => {
            return `\\right)${subSup || ''} $$`;
        })

        // 3. Fix cases where AI uses \( \) or \[ \] (Standard LaTeX)
        .replace(/\\\[/g, '$$$$')
        .replace(/\\\]/g, '$$$$')
        .replace(/\\\( /g, '$$')
        .replace(/ \\\)/g, '$$');
    };

  return (
    <div>
      <input className = "bg-gray-800" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button className = "hover:cursor-pointer" onClick={handleAiChat} disabled={loading}>
        {loading ? "Loading..." : "Get AI Explanation"}
      </button>

      {aiResponse && 
      <div className="mt-4 p-4 bg-gray-900 rounded-lg text-white">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
          {preprocessMarkdown(cleanMathAI(aiResponse))}
        </ReactMarkdown>
      </div>
      }
    </div>
  );
}
