# Repository Configurator - Cloudflare Worker

A webhook handler that automatically configures GitHub Actions permissions when repositories are created from the template.

## Setup

### 1. Create a GitHub App

1. Go to https://github.com/settings/apps/new
2. Fill in:
   - **Name**: "Claude Agent Template Configurator"
   - **Homepage URL**: Your repo URL
   - **Webhook URL**: Will set after deploying worker
   - **Webhook secret**: Generate a secure random string
3. Set permissions:
   - **Repository permissions**:
     - `Actions`: Read and write
     - `Administration`: Read and write
4. Subscribe to events:
   - Check `Repository`
5. Click **Create GitHub App**
6. Generate a private key and download it
7. Note your App ID (shown on the app page)
8. Make the app public (Settings > Advanced > Make public)
9. Install the app on your account (select "All repositories")

### 2. Deploy the Worker

```bash
cd workers/repo-configurator
npm install

# Set secrets
wrangler secret put GITHUB_APP_ID
wrangler secret put GITHUB_APP_PRIVATE_KEY
wrangler secret put GITHUB_WEBHOOK_SECRET

# Deploy
wrangler deploy
```

### 3. Update GitHub App Webhook URL

1. Copy the Worker URL from the deploy output (e.g., `https://repo-configurator.<your-subdomain>.workers.dev`)
2. Go to your GitHub App settings
3. Update the **Webhook URL** with the Worker URL
4. Save changes

## Testing

1. Create a new repository from the template
2. Check the Worker logs: `wrangler tail`
3. Verify settings in the new repo's Settings > Actions

## Configuration

The worker configures:
- Allow all actions and reusable workflows
- Workflow permissions: Read and write
- Allow GitHub Actions to create and approve PRs
- Cache size limit: 10 GB

Note: Artifact/log retention and cache retention days are only configurable at the organization level via API.
