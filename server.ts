import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
const PORT = 3000;

// Trust proxy is required for correct protocol detection behind nginx/load balancers
app.set('trust proxy', true);

// Middleware to parse JSON bodies
app.use(express.json());

// --- OAuth Routes ---

// Helper to determine the correct app URL
const getAppUrl = (req: express.Request) => {
  // 1. Check for client-provided origin (most reliable for client-side initiated flows)
  if (req.query.origin && typeof req.query.origin === 'string') {
    return req.query.origin;
  }

  // 2. Check environment variable
  if (process.env.APP_URL) return process.env.APP_URL;
  
  // 3. Fallback to request headers for dynamic environments
  const host = req.get('host');
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  return `${proto}://${host}`;
};

// Expose Client ID to frontend
app.get('/api/auth/config', (req, res) => {
  res.json({ 
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  });
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  let redirectUri = '';
  
  // Try to recover the redirect_uri from the state parameter
  if (state && typeof state === 'string') {
      try {
          // Decode state (base64)
          const stateJson = Buffer.from(state, 'base64').toString('utf-8');
          const stateData = JSON.parse(stateJson);
          if (stateData.redirectUri) {
              redirectUri = stateData.redirectUri;
              console.log('Recovered redirect_uri from state:', redirectUri);
          }
      } catch (e) {
          console.error('Failed to parse state parameter:', e);
      }
  }

  // Fallback if state is missing or invalid
  if (!redirectUri) {
      const appUrl = getAppUrl(req);
      redirectUri = `${appUrl}/auth/callback`;
      console.log('Fallback redirect_uri:', redirectUri);
  }

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // Fetch user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const userData = await userResponse.json();

    // Send success message to opener
    const html = `
      <html>
        <body>
          <script>
            // Send message to parent window
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                user: ${JSON.stringify(userData)},
                provider: 'google'
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Authentication successful. You can close this window.';
            }
          </script>
          <p>Authentication successful. Closing...</p>
        </body>
      </html>
    `;
    
    res.send(html);

  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    // Note: This block is just a placeholder as the build command handles static file generation
    // but for a full-stack app in this environment, we rely on the dev server mostly.
    // However, if deployed, we'd serve static files.
    // For this environment, we stick to dev mode mostly.
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
