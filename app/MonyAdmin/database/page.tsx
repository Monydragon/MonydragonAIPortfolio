"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";

export default function DatabaseManagementPage() {
  const { data: session } = useSession();
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [containers, setContainers] = useState<string[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>("");
  const [containersLoading, setContainersLoading] = useState(false);
  const [dockerAvailable, setDockerAvailable] = useState<boolean | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Fetch available Docker containers for MongoDB
  useEffect(() => {
    const fetchContainers = async () => {
      setContainersLoading(true);
      try {
        const response = await fetch("/api/database/containers");
        if (!response.ok) {
          throw new Error("Failed to fetch Docker containers");
        }
        const data = await response.json();
        setContainers(data.containers || []);
        setDockerAvailable(data.dockerAvailable ?? null);
        if (data.defaultContainer) {
          setSelectedContainer(data.defaultContainer);
        } else if ((data.containers || []).length > 0) {
          setSelectedContainer(data.containers[0]);
        }
      } catch (error) {
        // Silent fail – user can still use direct connection via MONGODB_URI
        setDockerAvailable(false);
      } finally {
        setContainersLoading(false);
      }
    };

    fetchContainers();
  }, []);

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    setMessage(null);

    try {
      const response = await fetch("/api/database/test");
      const data = await response.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: data.message,
          details: {
            database: data.database,
            connectionTime: data.connectionTime,
            pingTime: data.pingTime,
            totalTime: data.totalTime,
            collections: data.collections,
            collectionCount: data.collectionCount,
            connectionState: data.connectionState,
          },
        });
        setMessage({ type: "success", text: data.message });
      } else {
        setTestResult({
          success: false,
          message: data.message || "Connection test failed",
          details: { error: data.error },
        });
        setMessage({ type: "error", text: data.message || "Connection test failed" });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "Failed to test connection",
      });
      setMessage({ type: "error", text: error.message || "Failed to test connection" });
    } finally {
      setTestLoading(false);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    setMessage(null);

    try {
      // If Docker is available but no container is selected, show error
      if (dockerAvailable === true && containers.length > 0 && !selectedContainer) {
        setMessage({ 
          type: "error", 
          text: "Please select a Docker container from the dropdown above." 
        });
        setBackupLoading(false);
        return;
      }

      const endpoint = selectedContainer
        ? `/api/database/backup?container=${encodeURIComponent(selectedContainer)}`
        : "/api/database/backup";

      console.log("Backup request - selectedContainer:", selectedContainer);
      console.log("Backup request - endpoint:", endpoint);
      console.log("Backup request - dockerAvailable:", dockerAvailable);
      console.log("Backup request - containers:", containers);

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create backup");
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `mongodb-dump-${new Date().toISOString().split("T")[0]}.tar.gz`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setMessage({ type: "success", text: "Backup created and downloaded successfully!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to create backup" });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      setMessage({ type: "error", text: "Please select a backup file" });
      return;
    }

    // If Docker is available but no container is selected, show error
    if (dockerAvailable === true && containers.length > 0 && !selectedContainer) {
      setMessage({ 
        type: "error", 
        text: "Please select a Docker container from the dropdown above." 
      });
      return;
    }

    if (!confirm("⚠️ WARNING: This will replace all existing data in the database. Are you sure you want to continue?")) {
      return;
    }

    setRestoreLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", restoreFile);
      if (selectedContainer) {
        formData.append("container", selectedContainer);
      }

      console.log("Restore request - selectedContainer:", selectedContainer);
      console.log("Restore request - dockerAvailable:", dockerAvailable);
      console.log("Restore request - containers:", containers);

      const response = await fetch("/api/database/restore", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to restore database");
      }

      setMessage({ type: "success", text: "Database restored successfully! Please refresh the page." });
      setRestoreFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("restore-file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to restore database" });
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Database Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Backup and restore your MongoDB database
              </p>
            </div>
            <Link href="/MonyAdmin">
              <AnimatedButton variant="secondary">Back to Dashboard</AnimatedButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Docker Container Selection */}
          <AnimatedCard>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                MongoDB Docker Container
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Select the Docker container that is running MongoDB. This will be used for backup and restore operations.
              </p>
              {dockerAvailable === false && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  Docker does not appear to be available. The system will fall back to connecting via <code>MONGODB_URI</code>.
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <select
                  value={selectedContainer}
                  onChange={(e) => setSelectedContainer(e.target.value)}
                  disabled={containersLoading || containers.length === 0}
                  className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {containers.length === 0 && (
                    <option value="">No Docker containers detected</option>
                  )}
                  {containers.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {selectedContainer && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Current selection: <span className="font-mono">{selectedContainer}</span>
                  </span>
                )}
              </div>
            </div>
          </AnimatedCard>

          {/* MongoDB Connection Test */}
          <AnimatedCard>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl">
                  🔌
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Test MongoDB Connection
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Verify that your application can connect to MongoDB and view connection details.
                  </p>
                  <AnimatedButton
                    onClick={handleTestConnection}
                    disabled={testLoading}
                    className="w-full sm:w-auto"
                  >
                    {testLoading ? "Testing..." : "Test Connection"}
                  </AnimatedButton>
                  {testResult && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${
                        testResult.success
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      <p
                        className={`font-semibold mb-2 ${
                          testResult.success
                            ? "text-green-800 dark:text-green-200"
                            : "text-red-800 dark:text-red-200"
                        }`}
                      >
                        {testResult.success ? "✅ Connection Successful" : "❌ Connection Failed"}
                      </p>
                      <p
                        className={`text-sm mb-2 ${
                          testResult.success
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {testResult.message}
                      </p>
                      {testResult.details && testResult.success && (
                        <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                          <p>
                            <span className="font-semibold">Database:</span> {testResult.details.database}
                          </p>
                          <p>
                            <span className="font-semibold">Connection Time:</span> {testResult.details.connectionTime}
                          </p>
                          <p>
                            <span className="font-semibold">Ping Time:</span> {testResult.details.pingTime}
                          </p>
                          <p>
                            <span className="font-semibold">Total Time:</span> {testResult.details.totalTime}
                          </p>
                          <p>
                            <span className="font-semibold">Collections:</span> {testResult.details.collectionCount} (
                            {testResult.details.collections?.join(", ") || "none"})
                          </p>
                          <p>
                            <span className="font-semibold">Connection State:</span> {testResult.details.connectionState}
                          </p>
                        </div>
                      )}
                      {testResult.details?.error && (
                        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                          <span className="font-semibold">Error:</span> {testResult.details.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Backup Section */}
          <AnimatedCard>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl">
                  💾
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Create Backup
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Export your entire MongoDB database as a compressed archive. This includes all collections: users, blog posts, projects, experiences, site content, and LLM configurations.
                  </p>
                  <AnimatedButton
                    onClick={handleBackup}
                    disabled={backupLoading || (dockerAvailable === true && containers.length > 0 && !selectedContainer)}
                    className="w-full sm:w-auto"
                  >
                    {backupLoading ? "Creating Backup..." : "Download Backup"}
                  </AnimatedButton>
                  {dockerAvailable === true && containers.length > 0 && !selectedContainer && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ Please select a Docker container above before creating a backup.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Restore Section */}
          <AnimatedCard>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl">
                  📥
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Restore Database
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Import a previously created backup file. <strong className="text-red-600 dark:text-red-400">Warning:</strong> This will replace all existing data in the database.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="restore-file"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Select Backup File (.tar.gz)
                      </label>
                      <input
                        id="restore-file"
                        type="file"
                        accept=".tar.gz,.gz"
                        onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 dark:file:bg-blue-900/20
                          file:text-blue-700 dark:file:text-blue-300
                          hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30
                          cursor-pointer
                          border border-gray-300 dark:border-gray-700 rounded-lg p-2
                          bg-white dark:bg-gray-800"
                      />
                      {restoreFile && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Selected: {restoreFile.name} ({(restoreFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    <AnimatedButton
                      onClick={handleRestore}
                      disabled={restoreLoading || !restoreFile}
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      {restoreLoading ? "Restoring..." : "Restore Database"}
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Info Section */}
          <AnimatedCard>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ℹ️ Important Notes
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                <li>Backups are created using MongoDB&apos;s native dump format</li>
                <li>Backup files are compressed as .tar.gz archives</li>
                <li>Restoring will completely replace all existing data</li>
                <li>Always create a backup before restoring</li>
                <li>The restore process may take a few minutes depending on database size</li>
                <li>After restoring, you may need to refresh the page to see changes</li>
              </ul>
            </div>
          </AnimatedCard>
        </div>
      </main>
    </div>
  );
}

