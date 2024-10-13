"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as shadcn from "@/components/ui";
import { Editor } from "@monaco-editor/react";
import { LiveProvider, LiveError, LivePreview } from "react-live-runner";
import Navbar from "@/components/ui/navbar";

const scope = {
  React,
  ReactDOM: React,
  shadcn,
  useState,
  useEffect,
  useRef,
  useCallback,
};

export default function Home() {
  const [editorCode, setEditorCode] = useState(``);
  const [liveCode, setLiveCode] = useState("");
  const [key, setKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // 50% initial width
  const [styles, setStyles] = useState<React.ReactNode | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isIterating, setIsIterating] = useState(false);

  const [addCodeList, setAddCodeList] = useState<string[]>([]);
  const [addCodeCount, setAddCodeCount] = useState(0);

  useEffect(() => {
    setStyles(
      <style>{`
        @import url("https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css");
        :root {
          --background: 0 0% 100%;
          --foreground: 240 10% 3.9%;
          --card: 0 0% 100%;
          --card-foreground: 240 10% 3.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 240 10% 3.9%;
          --primary: 240 5.9% 10%;
          --primary-foreground: 0 0% 98%;
          --secondary: 240 4.8% 95.9%;
          --secondary-foreground: 240 5.9% 10%;
          --muted: 240 4.8% 95.9%;
          --muted-foreground: 240 3.8% 46.1%;
          --accent: 240 4.8% 95.9%;
          --accent-foreground: 240 5.9% 10%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 0 0% 98%;
          --border: 240 5.9% 90%;
          --input: 240 5.9% 90%;
          --ring: 240 10% 3.9%;
          --radius: 0.5rem;
        }
        .dark {
          --background: 0 0% 0%;
          --foreground: 0 0% 100%;
          --card: 0 0% 0%;
          --card-foreground: 0 0% 100%;
          --popover: 0 0% 0%;
          --popover-foreground: 0 0% 100%;
          --primary: 0 0% 100%;
          --primary-foreground: 0 0% 0%;
          --secondary: 0 0% 10%;
          --secondary-foreground: 0 0% 100%;
          --muted: 0 0% 10%;
          --muted-foreground: 0 0% 70%;
          --accent: 0 0% 10%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 0 0% 100%;
          --border: 0 0% 20%;
          --input: 0 0% 20%;
          --ring: 0 0% 80%;
        }
      `}</style>
    );
  }, []);

  const dividerRef = useRef<HTMLDivElement>(null);

  const handleGenerateClick = () => {
    setLiveCode(editorCode);
  };

  const handlePromptGenerate = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/generate_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate code");
      }

      const data = await response.json();
      setEditorCode(data.code);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCode = async () => {
    console.log("Attempting to send code:", editorCode); // Log the code being sent
    setAddCodeList([...addCodeList, editorCode]);
    setAddCodeCount(prevCount => prevCount + 1);
    // if (!editorCode) {
    //   console.error("No code to send");
    //   return;
    // }
    // try {
    //   const response = await fetch("/api/add_code", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ code: editorCode }),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.error || "Failed to add code");
    //   }

    //   const responseData = await response.json();
    //   console.log("Server response:", responseData);

    //   console.log("Code added successfully");
    // } catch (err) {
    //   console.error("Error adding code: ", err);
    // }
  }; // You might want to generate this dynamically

  const handleDeployVariants = async () => {
    console.log("Deploying variants", addCodeList.length, addCodeList);

    if (!key) {
      console.error("No current key selected");
      return;
    }

    try {
      const response = await fetch("/api/deploy_variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentKey: key, variants: addCodeList }),
      });

      if (!response.ok) {
        throw new Error("Failed to deploy variants");
      }

      const data = await response.json();
      console.log(data.message);

      // Optionally, clear the addCodeList after successful deployment
      setAddCodeList([]);
    } catch (error) {
      console.error("Error deploying variants:", error);
    }
  };

  const handleIterate = async () => {
    try {
      setIsIterating(true);
      const response = await fetch("/api/iterate_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, currentVersion: editorCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to iterate code");
      }

      const data = await response.json();
      setEditorCode(data.code);
    } catch (err) {
      console.error(err);
    } finally {
      setIsIterating(false);
    }
  };

  const handleGenerateKey = async () => {
    try {
      const response = await fetch("/api/generate_key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to iterate code");
      }

      const data = await response.json();
      setKey(data.key);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newWidth = (e.clientX / window.innerWidth) * 100;
    setLeftPanelWidth(Math.max(20, Math.min(80, newWidth))); // Limit between 20% and 80%
  }, []);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    const divider = dividerRef.current;
    if (divider) {
      divider.addEventListener("mousedown", handleMouseDown);

      return () => {
        divider.removeEventListener("mousedown", handleMouseDown);
      };
    }
  }, [handleMouseDown]);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans">
      <Navbar />
      {/* Main content */}
      <div className="flex-1 overflow-hidden flex px-20 pb-8"> {/* Added pb-8 here */}
        {/* Left side: Prompt input and Code editor */}
        <div
          className="flex flex-col overflow-hidden pr-4"
          style={{ width: `calc(${leftPanelWidth}% - 2px)` }}
        >
          {/* Prompt input */}
          <div className="bg-black py-6">
            <label htmlFor="prompt-input" className="text-xl font-bold mb-2 block">
              Enter Prompt Here to Generate
            </label>
            <p className="text-sm text-gray-400 mb-2">
              Example: "Create a button component with hover effects"
            </p>
            <shadcn.Textarea
              id="prompt-input"
              placeholder="Enter your prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full mb-2 bg-zinc-900 text-white border-zinc-800"
              rows={4}
            />
            <div className="mt-6 flex space-x-2"> {/* Added mt-6 here */}
              <shadcn.Button
                onClick={handlePromptGenerate}
                disabled={isGenerating || !prompt}
                className="bg-white text-black hover:bg-gray-200 font-bold"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </shadcn.Button>
              <shadcn.Button
                onClick={handleIterate}
                disabled={isIterating || !prompt}
                className="bg-white text-black hover:bg-gray-200 font-bold"
              >
                {isIterating ? "Iterating..." : "Iterate"}
              </shadcn.Button>
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 overflow-hidden mt-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Code Editor</h2>
            <div className="flex-1 bg-zinc-900 rounded-lg shadow-md overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                value={editorCode}
                onChange={(value: string | undefined) => setEditorCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  renderValidationDecorations: "off",
                  overviewRulerBorder: false,
                }}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <shadcn.Button
                disabled={!editorCode}
                onClick={handleGenerateClick}
                className="bg-white text-black hover:bg-gray-200 font-bold"
              >
                Update Preview
              </shadcn.Button>
            </div>
          </div>
        </div>

        {/* Draggable divider */}
        <div
          ref={dividerRef}
          className="w-1 bg-black cursor-col-resize hover:bg-gray-800 transition-colors"
        />

        {/* Right side: Generate Unique Key and Preview */}
        <div
          className="flex flex-col overflow-hidden pl-4"
          style={{ width: `calc(${100 - leftPanelWidth}% - 2px)` }}
        >
          {/* Generate Unique Key */}
          <div className="bg-black py-6">
            <label htmlFor="key-input" className="text-xl font-bold mb-2 block">
              Generate Unique Key
            </label>
            <p className="text-sm text-gray-400 mb-2">
              The unique key is specific to each component generated
            </p>
            <shadcn.Textarea
              id="key-input"
              placeholder="Generate unique key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full mb-2 bg-zinc-900 text-white border-zinc-800"
              rows={4}
            />
            <div className="mt-6 flex justify-end"> {/* Added mt-6 here */}
              <shadcn.Button
                onClick={handleGenerateKey}
                disabled={!prompt}
                className="bg-white text-black hover:bg-gray-200 font-bold"
              >
                Generate Key
              </shadcn.Button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-hidden mt-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Preview</h2>
            <div className="flex-1 bg-zinc-900 rounded-lg shadow-md p-6 overflow-auto">
              <div className="inline-block min-w-full">
                <LiveProvider code={liveCode} scope={{ ...scope, styles }}>
                  {styles}
                  <LivePreview />
                  <LiveError />
                </LiveProvider>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2 items-center">
              <span className="text-white mr-2">Added: {addCodeCount}</span>
              <shadcn.Button
                disabled={!editorCode || !key}
                onClick={handleAddCode}
                className="bg-white text-black hover:bg-gray-200 font-bold"
              >
                Add Code
              </shadcn.Button>
              <shadcn.Button
                disabled={addCodeList.length === 0}
                onClick={handleDeployVariants}
                className="bg-white text-black hover:bg-gray-200 font-bold"
              >
                Deploy Variants
              </shadcn.Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}