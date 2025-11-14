"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface AIAssistantProps {
  onAction: (action: string, options?: any) => void;
  onClose: () => void;
  available: boolean;
  hasContent: boolean;
}

type PresetAction = 
  | "generate-full"
  | "refactor"
  | "stylize"
  | "change-tone"
  | "expand"
  | "condense"
  | "improve-clarity"
  | "add-details"
  | "fix-grammar"
  | "make-formal"
  | "make-casual"
  | "add-examples"
  | "custom";

const toneOptions = [
  "professional",
  "casual",
  "friendly",
  "technical",
  "conversational",
  "academic",
  "humorous",
  "serious",
];

export function AIAssistant({ onAction, onClose, available, hasContent }: AIAssistantProps) {
  const [selectedAction, setSelectedAction] = useState<PresetAction | null>(null);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [instruction, setInstruction] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState(2000);
  const [temperature, setTemperature] = useState(0.7);
  const [generateMetadata, setGenerateMetadata] = useState(true);

  if (!available) {
    return null;
  }

  const handlePresetAction = (action: PresetAction) => {
    if (action === "generate-full") {
      if (!topic.trim()) {
        alert("Please enter a topic");
        return;
      }
      onAction("generate-full", {
        topic,
        tone,
        generateMetadata,
      });
      onClose();
    } else if (action === "custom") {
      if (!customPrompt.trim()) {
        alert("Please enter a custom prompt");
        return;
      }
      onAction("custom", {
        prompt: customPrompt,
        systemPrompt: systemPrompt || undefined,
        maxTokens,
        temperature,
      });
      onClose();
    } else {
      // Content modification actions
      if (!hasContent) {
        alert("Please add some content first");
        return;
      }

      let instructionText = "";
      switch (action) {
        case "refactor":
          instructionText = "Refactor and restructure this content for better organization and flow";
          break;
        case "stylize":
          instructionText = `Rewrite this content in a ${tone} style`;
          break;
        case "change-tone":
          instructionText = `Change the tone of this content to be more ${tone}`;
          break;
        case "expand":
          instructionText = "Expand this content with more details, examples, and explanations";
          break;
        case "condense":
          instructionText = "Condense this content while keeping all key information";
          break;
        case "improve-clarity":
          instructionText = "Improve the clarity and readability of this content";
          break;
        case "add-details":
          instructionText = "Add more details, examples, and supporting information to this content";
          break;
        case "fix-grammar":
          instructionText = "Fix grammar, spelling, and punctuation errors in this content";
          break;
        case "make-formal":
          instructionText = "Rewrite this content in a more formal, professional tone";
          break;
        case "make-casual":
          instructionText = "Rewrite this content in a more casual, conversational tone";
          break;
        case "add-examples":
          instructionText = "Add relevant examples and use cases to illustrate the points in this content";
          break;
      }

      onAction("improve", {
        instruction: instruction || instructionText,
        tone: action.includes("tone") || action === "stylize" ? tone : undefined,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Assistant
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Generate Full Blog Post */}
            <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-semibold mb-3">Generate Full Blog Post</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Topic *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    placeholder="Enter blog post topic..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    >
                      {toneOptions.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generateMetadata}
                        onChange={(e) => setGenerateMetadata(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm">Auto-generate metadata</span>
                    </label>
                  </div>
                </div>
                <AnimatedButton
                  onClick={() => handlePresetAction("generate-full")}
                  variant="primary"
                  className="w-full"
                  disabled={!topic.trim()}
                >
                  ✨ Generate Full Blog Post
                </AnimatedButton>
              </div>
            </div>

            {/* Content Modification Presets */}
            {hasContent && (
              <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
                <h3 className="text-lg font-semibold mb-3">Content Modification</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => handlePresetAction("refactor")}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
                  >
                    🔄 Refactor
                  </button>
                  <button
                    onClick={() => handlePresetAction("expand")}
                    className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 text-sm"
                  >
                    📈 Expand
                  </button>
                  <button
                    onClick={() => handlePresetAction("condense")}
                    className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 text-sm"
                  >
                    📉 Condense
                  </button>
                  <button
                    onClick={() => handlePresetAction("improve-clarity")}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 text-sm"
                  >
                    ✨ Improve Clarity
                  </button>
                  <button
                    onClick={() => handlePresetAction("fix-grammar")}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 text-sm"
                  >
                    ✓ Fix Grammar
                  </button>
                  <button
                    onClick={() => handlePresetAction("add-details")}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 text-sm"
                  >
                    📝 Add Details
                  </button>
                  <button
                    onClick={() => handlePresetAction("make-formal")}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                  >
                    👔 Make Formal
                  </button>
                  <button
                    onClick={() => handlePresetAction("make-casual")}
                    className="px-4 py-2 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-800 text-sm"
                  >
                    😊 Make Casual
                  </button>
                  <button
                    onClick={() => handlePresetAction("add-examples")}
                    className="px-4 py-2 bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800 text-sm"
                  >
                    💡 Add Examples
                  </button>
                </div>

                {/* Tone-based actions */}
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium">Change Tone / Stylize</label>
                  <div className="flex gap-2">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    >
                      {toneOptions.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handlePresetAction("change-tone")}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Change Tone
                    </button>
                    <button
                      onClick={() => handlePresetAction("stylize")}
                      className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800"
                    >
                      Stylize
                    </button>
                  </div>
                </div>

                {/* Custom instruction */}
                <div>
                  <label className="block text-sm font-medium mb-2">Custom Instruction (Optional)</label>
                  <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    placeholder="Add specific instructions for the AI..."
                  />
                </div>
              </div>
            )}

            {/* Custom Prompt */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Custom Prompt</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">System Prompt (Optional)</label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    placeholder="Set the AI's role or context..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prompt *</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-mono text-sm"
                    placeholder="Enter your custom prompt..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Tokens: {maxTokens}</label>
                    <input
                      type="range"
                      min="100"
                      max="4000"
                      step="100"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Temperature: {temperature.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                <AnimatedButton
                  onClick={() => handlePresetAction("custom")}
                  variant="secondary"
                  className="w-full"
                  disabled={!customPrompt.trim()}
                >
                  Generate with Custom Prompt
                </AnimatedButton>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

