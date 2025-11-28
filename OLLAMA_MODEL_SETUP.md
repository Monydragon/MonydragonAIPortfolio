# Ollama Model Setup Guide

This guide explains how to add and manage models in the Ollama Docker container for use with the LLM features.

## Quick Start

### 1. Start Ollama Container

```bash
# Start the Ollama container
npm run docker:ollama:up

# Or using docker-compose directly
docker-compose -f docker-compose.ollama.yml up -d
```

### 2. Pull a Model

Use the provided script to pull models easily:

```bash
# Pull the default recommended model (llama3.2)
npm run docker:ollama:pull

# Pull a specific model
npm run docker:ollama:pull llama3.2
npm run docker:ollama:pull llama3.1
npm run docker:ollama:pull mistral
npm run docker:ollama:pull codellama
npm run docker:ollama:pull phi3
```

### 3. List Available Models

```bash
# List all models in the container
npm run docker:ollama:list

# Or manually
docker exec -it ollama ollama list
```

### 4. Configure in Admin Panel

1. Go to **Admin Dashboard** → **LLM Configuration**
2. Select **Ollama** as the provider
3. Set **Base URL**: `http://localhost:11434`
4. Select your model from the dropdown (or enter manually)
5. Click **Save Configuration**
6. Check the connection status banner

## Recommended Models

### For General Use (Recommended)
- **llama3.2** (2B-3B parameters) - Fast, efficient, good quality
- **llama3.1** (8B parameters) - Better quality, slower
- **mistral** (7B parameters) - Fast and capable

### For Code/Technical Content
- **codellama** (7B-13B parameters) - Specialized for code
- **phi3** (3.8B parameters) - Small, efficient, good for code

### Model Sizes

Models vary in size and will take time to download:

| Model | Size | RAM Required | Download Time* |
|-------|------|--------------|----------------|
| llama3.2 | ~2GB | 4GB | 5-10 min |
| llama3.1 | ~4.5GB | 8GB | 15-20 min |
| mistral | ~4GB | 8GB | 15-20 min |
| codellama | ~3.8GB | 8GB | 15-20 min |
| phi3 | ~2.3GB | 4GB | 5-10 min |

*Download time depends on your internet connection

## Manual Commands

If you prefer to use Docker commands directly:

```bash
# Pull a model
docker exec -it ollama ollama pull llama3.2

# List models
docker exec -it ollama ollama list

# Remove a model
docker exec -it ollama ollama rm llama3.2

# Show model info
docker exec -it ollama ollama show llama3.2
```

## Troubleshooting

### No Models Showing

If models aren't appearing in the LLM Configuration page:

1. **Check if Ollama container is running:**
   ```bash
   docker ps | grep ollama
   ```

2. **Check container logs:**
   ```bash
   npm run docker:ollama:logs
   ```

3. **Verify models are pulled:**
   ```bash
   npm run docker:ollama:list
   ```

4. **Test Ollama API directly:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

5. **Refresh the LLM Configuration page** and click the "Refresh" button

### Connection Issues

If you see "Connection Failed" in the status banner:

1. **Verify container is running:**
   ```bash
   docker ps | grep ollama
   ```

2. **Check if port 11434 is accessible:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. **Restart the container:**
   ```bash
   npm run docker:ollama:down
   npm run docker:ollama:up
   ```

4. **Check Docker network:**
   ```bash
   docker network ls | grep monydragon-network
   ```

### Model Not Found Error

If you get "Model not found" errors:

1. **Verify the model is pulled:**
   ```bash
   npm run docker:ollama:list
   ```

2. **Pull the model if missing:**
   ```bash
   npm run docker:ollama:pull <model-name>
   ```

3. **Check model name spelling** - Model names are case-sensitive

### Out of Memory

If you see memory errors:

1. **Use a smaller model** (e.g., `llama3.2` instead of `llama3.1`)
2. **Increase Docker memory limit** in Docker Desktop settings
3. **Check available RAM:**
   ```bash
   docker stats ollama
   ```

## Advanced Configuration

### Using Custom Base URL

If Ollama is running on a different host or port:

1. Update the **Base URL** in LLM Configuration
2. For Docker network access: `http://ollama:11434`
3. For remote server: `http://your-server-ip:11434`

### GPU Support

To enable GPU acceleration (NVIDIA):

1. Install [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

2. Uncomment GPU configuration in `docker-compose.ollama.yml`:
   ```yaml
   deploy:
     resources:
       reservations:
         devices:
           - driver: nvidia
             count: 1
             capabilities: [gpu]
   ```

3. Restart the container:
   ```bash
   npm run docker:ollama:down
   npm run docker:ollama:up
   ```

### Persistent Storage

Models are stored in a Docker volume (`ollama_data`) and persist across container restarts. To view volume location:

```bash
docker volume inspect monydragon-ai-portfolio_ollama_data
```

## Best Practices

1. **Start with a small model** (llama3.2) to test functionality
2. **Monitor resource usage** with `docker stats ollama`
3. **Keep models you actually use** - Remove unused models to save space
4. **Use GPU if available** - Significantly faster inference
5. **Check model compatibility** - Some models work better for specific tasks

## Additional Resources

- [Ollama Official Documentation](https://ollama.ai/docs)
- [Available Models](https://ollama.ai/library)
- [Docker Compose Guide](./COMPLETE_SERVER_SETUP_GUIDE.md)

