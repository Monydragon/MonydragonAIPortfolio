"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface Model {
  id: string;
  name: string;
  description?: string;
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  provider?: string;
}

type SortOption = "name" | "description" | "default";

export function ModelSelector({
  models,
  selectedModel,
  onSelect,
  onRefresh,
  loading = false,
  placeholder = "Select a model...",
  disabled = false,
  provider,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0, width: 0 });

  const selectedModelData = models.find((m) => m.id === selectedModel);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const modalHeight = 500; // max-h-[500px]
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // Determine if modal should open above or below
        let top = rect.bottom + window.scrollY + 8;
        if (spaceBelow < modalHeight && spaceAbove > spaceBelow) {
          // Open above if there's more space above
          top = rect.top + window.scrollY - modalHeight - 8;
        }
        
        // Ensure modal doesn't go off-screen horizontally
        let left = rect.left + window.scrollX;
        const modalWidth = Math.max(rect.width, 300); // Minimum width of 300px
        if (left + modalWidth > viewportWidth) {
          left = viewportWidth - modalWidth - 16;
        }
        if (left < 16) {
          left = 16;
        }
        
        setModalPosition({
          top: Math.max(8, top),
          left,
          width: Math.min(modalWidth, 500), // Max width of 500px
        });
      };
      
      // Calculate position immediately
      updatePosition();
      
      // Update on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else if (!isOpen) {
      // Reset position when closed
      setModalPosition({ top: 0, left: 0, width: 0 });
    }
  }, [isOpen]);

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = models.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.description?.toLowerCase().includes(query) ||
          model.id.toLowerCase().includes(query)
      );
    }

    // Sort models
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "description") {
      filtered = [...filtered].sort((a, b) =>
        (a.description || "").localeCompare(b.description || "")
      );
    }
    // "default" keeps original order

    return filtered;
  }, [models, searchQuery, sortBy]);

  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={buttonRef}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled && !loading) {
              setIsOpen(!isOpen);
            }
          }}
          disabled={disabled || loading}
          className={`flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-left ${
            disabled || loading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
          } transition-colors`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading models...</span>
            </div>
          ) : selectedModelData ? (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {selectedModelData.name}
              </div>
              {selectedModelData.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedModelData.description}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
        </button>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading || disabled}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 text-sm"
            title="Refresh available models"
          >
            {loading ? "..." : "Refresh"}
          </button>
        )}
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && !disabled && (
            <>
              <motion.div
                className="fixed inset-0 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />
              {modalPosition.width > 0 && (
                <motion.div
                  className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 max-h-[500px] min-h-[300px] flex flex-col overflow-hidden"
                  style={{
                    top: `${modalPosition.top}px`,
                    left: `${modalPosition.left}px`,
                    width: `${modalPosition.width}px`,
                    maxWidth: 'calc(100vw - 2rem)',
                  }}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                >
              {/* Search and Sort Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-800 space-y-2 flex-shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search models..."
                    className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="default">Default</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="description">Description</option>
                  </select>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredAndSortedModels.length} model{filteredAndSortedModels.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Model List */}
              <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(500px - 140px)' }}>
                {filteredAndSortedModels.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    {searchQuery ? "No models found matching your search" : "No models available"}
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredAndSortedModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleSelect(model.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedModel === model.id
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                      >
                        <div className="font-medium">{model.name}</div>
                        {model.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {model.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {provider && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 text-center flex-shrink-0">
                  Provider: {provider}
                </div>
              )}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

