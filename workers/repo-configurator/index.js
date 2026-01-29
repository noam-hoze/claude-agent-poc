/**
 * GitHub App Webhook Handler for Template Repository Configuration
 *
 * This Cloudflare Worker receives webhooks from a GitHub App when repositories
 * are created from the template. It automatically configures GitHub Actions
 * permissions for the new repository.
 */

// GitHub App configuration - set these in Cloudflare Workers secrets
// GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET

const TEMPLATE_REPO = 'noam-hoze/claude-agent-poc';

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get the raw body for signature verification
      const body = await request.text();

      // Verify webhook signature
      const signature = request.headers.get('X-Hub-Signature-256');
      if (!signature || !await verifySignature(body, signature, env.GITHUB_WEBHOOK_SECRET)) {
        return new Response('Invalid signature', { status: 401 });
      }

      const payload = JSON.parse(body);
      const event = request.headers.get('X-GitHub-Event');

      // Only process repository creation events
      if (event !== 'repository' || payload.action !== 'created') {
        return new Response('Event ignored', { status: 200 });
      }

      // Check if created from our template
      const templateRepo = payload.repository?.template_repository;
      if (!templateRepo || templateRepo.full_name !== TEMPLATE_REPO) {
        console.log(`Repository not created from ${TEMPLATE_REPO}, skipping`);
        return new Response('Not from target template', { status: 200 });
      }

      // Get repository info
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const installationId = payload.installation?.id;

      if (!installationId) {
        return new Response('No installation ID found', { status: 400 });
      }

      console.log(`Configuring ${owner}/${repo} (created from ${TEMPLATE_REPO})`);

      // Generate installation access token
      const token = await getInstallationToken(
        env.GITHUB_APP_ID,
        env.GITHUB_APP_PRIVATE_KEY,
        installationId
      );

      // Configure repository settings
      await configureRepository(owner, repo, token);

      return new Response(JSON.stringify({
        success: true,
        message: `Configured ${owner}/${repo}`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Verify GitHub webhook signature
 */
async function verifySignature(payload, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const expectedSignature = 'sha256=' + Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

/**
 * Generate a GitHub App installation access token
 */
async function getInstallationToken(appId, privateKey, installationId) {
  // Generate JWT
  const jwt = await generateJWT(appId, privateKey);

  // Exchange JWT for installation token
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Template-Repo-Configurator'
      }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get installation token: ${error}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Generate a JWT for GitHub App authentication
 */
async function generateJWT(appId, privateKey) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iat: now - 60,           // Issued 60 seconds ago (clock drift tolerance)
    exp: now + (10 * 60),    // Expires in 10 minutes
    iss: appId
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Import the private key
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signatureInput)
  );

  return `${signatureInput}.${base64url(signature)}`;
}

/**
 * Convert PEM private key to ArrayBuffer
 */
function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
    .replace(/-----END RSA PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Base64url encode
 */
function base64url(input) {
  let base64;
  if (typeof input === 'string') {
    base64 = btoa(input);
  } else {
    base64 = btoa(String.fromCharCode(...new Uint8Array(input)));
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Configure repository settings via GitHub API
 */
async function configureRepository(owner, repo, token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'Template-Repo-Configurator',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const results = [];

  // 1. Enable all actions and reusable workflows
  try {
    const actionsPermResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/permissions`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          enabled: true,
          allowed_actions: 'all'
        })
      }
    );
    results.push({
      setting: 'actions_permissions',
      success: actionsPermResponse.ok,
      status: actionsPermResponse.status
    });
  } catch (e) {
    results.push({ setting: 'actions_permissions', error: e.message });
  }

  // 2. Set workflow permissions (read/write) and allow PR creation/approval
  try {
    const workflowPermResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/permissions/workflow`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          default_workflow_permissions: 'write',
          can_approve_pull_request_reviews: true
        })
      }
    );
    results.push({
      setting: 'workflow_permissions',
      success: workflowPermResponse.ok,
      status: workflowPermResponse.status
    });
  } catch (e) {
    results.push({ setting: 'workflow_permissions', error: e.message });
  }

  // 3. Set cache size limit (10 GB) - Note: This endpoint may vary
  try {
    const cacheResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/cache/usage-policy`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          repo_cache_size_limit_in_gb: 10
        })
      }
    );
    results.push({
      setting: 'cache_size_limit',
      success: cacheResponse.ok,
      status: cacheResponse.status
    });
  } catch (e) {
    results.push({ setting: 'cache_size_limit', error: e.message });
  }

  console.log('Configuration results:', JSON.stringify(results));

  // Note: Artifact/log retention (90 days) and cache retention (7 days)
  // may only be configurable at the organization level via API.
  // These settings will use GitHub's defaults for personal repos.

  return results;
}
