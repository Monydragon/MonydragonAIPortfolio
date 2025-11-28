#!/usr/bin/env tsx
/**
 * Pull an Ollama model into the Docker container
 * Usage: npm run pull-ollama-model <model-name>
 * Example: npm run pull-ollama-model llama3.2
 */

import { execSync } from 'child_process';

const modelName = process.argv[2] || process.env.OLLAMA_MODEL || 'llama3.2';
const containerName = process.env.OLLAMA_CONTAINER_NAME || 'ollama';

console.log(`\n📥 Pulling Ollama model: ${modelName}`);
console.log(`   Container: ${containerName}\n`);

try {
  // Check if container is running
  try {
    const containerStatus = execSync(`docker ps --filter "name=${containerName}" --format "{{.Status}}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();

    if (!containerStatus) {
      console.error(`❌ Container "${containerName}" is not running.`);
      console.error(`   Please start it first: docker-compose -f docker-compose.ollama.yml up -d`);
      process.exit(1);
    }

    console.log(`✅ Container is running: ${containerStatus}\n`);
  } catch (error) {
    console.error(`❌ Error checking container status. Is Docker running?`);
    process.exit(1);
  }

  // Pull the model
  console.log(`⏳ Pulling model (this may take several minutes depending on model size)...\n`);
  
  execSync(`docker exec -it ${containerName} ollama pull ${modelName}`, {
    stdio: 'inherit',
  });

  console.log(`\n✅ Model "${modelName}" pulled successfully!`);
  console.log(`\n📋 To verify, run:`);
  console.log(`   docker exec -it ${containerName} ollama list`);
  console.log(`\n💡 You can now use this model in the LLM Configuration page.`);

} catch (error: any) {
  console.error(`\n❌ Error pulling model: ${error.message}`);
  console.error(`\n💡 Troubleshooting:`);
  console.error(`   1. Make sure the container is running: docker ps | grep ${containerName}`);
  console.error(`   2. Check container logs: docker logs ${containerName}`);
  console.error(`   3. Try pulling manually: docker exec -it ${containerName} ollama pull ${modelName}`);
  process.exit(1);
}

