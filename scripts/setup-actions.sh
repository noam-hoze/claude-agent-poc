#!/bin/bash
#
# Setup script to configure GitHub Actions permissions for this repository
#
# This script configures:
# - Allow all actions and reusable workflows
# - Workflow permissions: read and write
# - Allow GitHub Actions to create and approve pull requests
#
# Prerequisites:
# - GitHub CLI (gh) installed and authenticated: https://cli.github.com/
# - You must have admin access to this repository
#
# Usage: ./scripts/setup-actions.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "GitHub Actions Permissions Setup"
echo "================================="
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI.${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [ -z "$REPO" ]; then
    echo -e "${RED}Error: Not in a GitHub repository or cannot determine repo.${NC}"
    exit 1
fi

echo -e "Repository: ${GREEN}${REPO}${NC}"
echo ""

# 1. Enable all actions and reusable workflows
echo -n "Enabling all actions and reusable workflows... "
if gh api -X PUT "/repos/${REPO}/actions/permissions" \
    -f enabled=true \
    -f allowed_actions=all \
    &> /dev/null; then
    echo -e "${GREEN}Done${NC}"
else
    echo -e "${YELLOW}Skipped (may require admin access)${NC}"
fi

# 2. Set workflow permissions to read/write and allow PR creation/approval
echo -n "Setting workflow permissions (read/write, allow PR approval)... "
if gh api -X PUT "/repos/${REPO}/actions/permissions/workflow" \
    -f default_workflow_permissions=write \
    -F can_approve_pull_request_reviews=true \
    &> /dev/null; then
    echo -e "${GREEN}Done${NC}"
else
    echo -e "${YELLOW}Skipped (may require admin access)${NC}"
fi

# 3. Try to set cache size limit (may not work for all repo types)
echo -n "Setting cache size limit (10 GB)... "
if gh api -X PATCH "/repos/${REPO}/actions/cache/usage-policy" \
    -F repo_cache_size_limit_in_gb=10 \
    &> /dev/null 2>&1; then
    echo -e "${GREEN}Done${NC}"
else
    echo -e "${YELLOW}Skipped (org-level setting or not available)${NC}"
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Note: Some settings like artifact/log retention (90 days) and cache"
echo "retention (7 days) can only be configured in the GitHub UI or at the"
echo "organization level."
echo ""
echo "To verify settings, visit:"
echo "https://github.com/${REPO}/settings/actions"
