# Claude Agent PoC

A template repository for creating projects with Claude AI integration via GitHub Actions.

## Features

- **Auto-solve workflow**: Automatically implements solutions for issues labeled `auto-solve`
- **Interactive Claude**: Mention `@claude` in issues or PRs to get AI assistance

## Quick Start

### 1. Create a Repository from this Template

Click **"Use this template"** button above to create a new repository.

### 2. Configure GitHub Actions Permissions

After creating your repository, you need to enable GitHub Actions permissions.

**Option A: Run the setup script** (Recommended)

```bash
# Make sure you have GitHub CLI installed and authenticated
gh auth login

# Run the setup script
./scripts/setup-actions.sh
```

**Option B: Configure manually in GitHub UI**

1. Go to your repository's **Settings** > **Actions** > **General**
2. Under "Actions permissions", select **"Allow all actions and reusable workflows"**
3. Under "Workflow permissions", select **"Read and write permissions"**
4. Check **"Allow GitHub Actions to create and approve pull requests"**
5. Click **Save**

### 3. Add Required Secrets

Go to **Settings** > **Secrets and variables** > **Actions** and add:

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude

## Usage

### Auto-solve Issues (Phased Workflow)

The auto-solve workflow includes human approval checkpoints to catch issues early:

1. **Create an issue** describing what you want implemented
2. **Add the `auto-solve` label** to start the workflow
3. **Review each phase** and approve or provide feedback:

```
[PLANNING] → /approve → [CODING] → /approve → [TESTING] → /approve → [PR CREATED]
     ↑                      ↑                      ↑
   feedback              feedback               feedback
   (revises)            (revises)              (revises)
```

**Commands:**
- `/approve` - Approve the current phase and proceed
- Any other comment - Provide feedback for Claude to revise

**Phase Labels:**
- `phase:planning` - Claude is analyzing and creating a plan
- `phase:coding` - Claude is implementing the approved plan
- `phase:testing` - Claude is validating the implementation
- `phase:complete` - PR created, all phases approved

### Interactive Claude

Mention `@claude` in:
- Issue comments
- PR reviews
- PR review comments

Claude will respond and help with your questions or requests.

## Project Structure

```
.github/
  workflows/
    auto-solve.yml    # Main workflow for Claude integration
scripts/
  setup-actions.sh    # Setup script for Actions permissions
workers/
  repo-configurator/  # Cloudflare Worker for auto-config (optional)
CLAUDE.md             # Instructions for Claude AI
```

## Advanced: Auto-Configuration with GitHub App

For zero-touch setup when creating repos from this template, you can deploy the included Cloudflare Worker and create a GitHub App.

See [`workers/repo-configurator/`](workers/repo-configurator/) for details.

## Requirements

- GitHub account
- Anthropic API key
- GitHub CLI (for setup script)
