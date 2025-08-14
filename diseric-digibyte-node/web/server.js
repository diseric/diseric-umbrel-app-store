const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// DigiByte RPC Configuration
const RPC_CONFIG = {
  host: process.env.DIGIBYTE_RPC_HOST || 'localhost',
  port: process.env.DIGIBYTE_RPC_PORT || 14022,
  user: process.env.DIGIBYTE_RPC_USER || 'umbrel',
  password: process.env.DIGIBYTE_RPC_PASSWORD || 'digibyte_secure_password'
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

// RPC call function
async function rpcCall(method, params = []) {
  try {
    const response = await axios.post(`http://${RPC_CONFIG.host}:${RPC_CONFIG.port}/`, {
      jsonrpc: '1.0',
      id: Date.now(),
      method: method,
      params: params
    }, {
      auth: {
        username: RPC_CONFIG.user,
        password: RPC_CONFIG.password
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    return response.data.result;
  } catch (error) {
    console.error(`RPC Error (${method}):`, error.message);
    throw new Error(`RPC call failed: ${error.message}`);
  }
}

// Routes
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DigiByte Node - Umbrel</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f23;
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #1a1a2e;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            overflow: hidden;
            border: 1px solid #16213e;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .umbrel-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .dashboard {
            padding: 40px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #2d3748;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #4a5568;
            transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
        }
        
        .stat-title {
            color: #a29bfe;
            font-size: 0.9em;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-value {
            font-size: 1.8em;
            font-weight: 700;
            color: #fff;
            margin-bottom: 5px;
        }
        
        .stat-subtitle {
            color: #cbd5e0;
            font-size: 0.8em;
        }
        
        .info-section {
            background: #2d3748;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
            border: 1px solid #4a5568;
        }
        
        .info-section h3 {
            color: #ff6b35;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #4a5568;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-label {
            color: #a29bfe;
            font-weight: 600;
        }
        
        .info-value {
            color: #cbd5e0;
            text-align: right;
        }
        
        .loading {
            text-align: center;
            color: #a29bfe;
            padding: 20px;
        }
        
        .error {
            background: #fc8181;
            color: #1a202c;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-online {
            background: #48bb78;
            box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.3);
        }
        
        .status-offline {
            background: #f56565;
            box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.3);
        }
        
        .refresh-btn {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 20px;
        }
        
        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255, 107, 53, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="umbrel-badge">🏠 Umbrel App</div>
            <h1>💎 DigiByte Node</h1>
            <p>Decentralized blockchain with focus on security and speed</p>
        </div>
        
        <div class="dashboard">
            <div id="loading" class="loading">
                <h3>Loading DigiByte node information...</h3>
                <p>Please wait while we connect to your node.</p>
            </div>
            
            <div id="content" style="display: none;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-title">Node Status</div>
                        <div class="stat-value">
                            <span id="node-status" class="status-indicator status-offline"></span>
                            <span id="status-text">Checking...</span>
                        </div>
                        <div class="stat-subtitle">Connection Status</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-title">Block Height</div>
                        <div class="stat-value" id="block-height">0</div>
                        <div class="stat-subtitle">Current blockchain height</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-title">Connections</div>
                        <div class="stat-value" id="connections">0</div>
                        <div class="stat-subtitle">Peer connections</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-title">Difficulty</div>
                        <div class="stat-value" id="difficulty">0</div>
                        <div class="stat-subtitle">Network difficulty</div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>📊 Network Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Network</span>
                            <span class="info-value" id="network">mainnet</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Version</span>
                            <span class="info-value" id="version">Loading...</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Protocol Version</span>
                            <span class="info-value" id="protocol-version">Loading...</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Verification Progress</span>
                            <span class="info-value" id="verification-progress">Loading...</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>💰 Blockchain Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Best Block Hash</span>
                            <span class="info-value" id="best-block-hash">Loading...</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Chain Work</span>
                            <span class="info-value" id="chain-work">Loading...</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Size on Disk</span>
                            <span class="info-value" id="size-on-disk">Loading...</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Pruned</span>
                            <span class="info-value" id="pruned">Loading...</span>
                        </div>
                    </div>
                </div>
                
                <button class="refresh-btn" onclick="loadNodeData()">
                    🔄 Refresh Data
                </button>
            </div>
            
            <div id="error" style="display: none;" class="error">
                <h3>❌ Connection Error</h3>
                <p>Unable to connect to DigiByte node. Please check if the node is running and try again.</p>
            </div>
        </div>
    </div>

    <script>
        async function loadNodeData() {
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const error = document.getElementById('error');
            
            try {
                // Show loading
                loading.style.display = 'block';
                content.style.display = 'none';
                error.style.display = 'none';
                
                // Fetch data from API
                const [infoResponse, blockchainResponse] = await Promise.all([
                    fetch('/api/info'),
                    fetch('/api/blockchain')
                ]);
                
                if (!infoResponse.ok || !blockchainResponse.ok) {
                    throw new Error('API request failed');
                }
                
                const info = await infoResponse.json();
                const blockchain = await blockchainResponse.json();
                
                // Update UI with data
                document.getElementById('block-height').textContent = info.blocks?.toLocaleString() || '0';
                document.getElementById('connections').textContent = info.connections || '0';
                document.getElementById('difficulty').textContent = parseFloat(info.difficulty || 0).toFixed(2);
                document.getElementById('version').textContent = info.version || 'Unknown';
                document.getElementById('protocol-version').textContent = info.protocolversion || 'Unknown';
                document.getElementById('network').textContent = info.testnet ? 'testnet' : 'mainnet';
                
                // Blockchain info
                document.getElementById('best-block-hash').textContent = blockchain.bestblockhash?.substring(0, 20) + '...' || 'Unknown';
                document.getElementById('chain-work').textContent = blockchain.chainwork?.substring(0, 20) + '...' || 'Unknown';
                document.getElementById('size-on-disk').textContent = formatBytes(blockchain.size_on_disk || 0);
                document.getElementById('pruned').textContent = blockchain.pruned ? 'Yes' : 'No';
                document.getElementById('verification-progress').textContent = ((blockchain.verificationprogress || 0) * 100).toFixed(1) + '%';
                
                // Update status
                const statusIndicator = document.getElementById('node-status');
                const statusText = document.getElementById('status-text');
                
                if (info.blocks && info.blocks > 0) {
                    statusIndicator.className = 'status-indicator status-online';
                    statusText.textContent = 'Online';
                } else {
                    statusIndicator.className = 'status-indicator status-offline';
                    statusText.textContent = 'Offline';
                }
                
                // Show content
                loading.style.display = 'none';
                content.style.display = 'block';
                
            } catch (err) {
                console.error('Error loading node data:', err);
                loading.style.display = 'none';
                error.style.display = 'block';
            }
        }
        
        function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
        
        // Load data on page load
        loadNodeData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadNodeData, 30000);
    </script>
</body>
</html>`);
});

// API Routes
app.get('/api/info', async (req, res) => {
  try {
    const info = await rpcCall('getinfo');
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/blockchain', async (req, res) => {
  try {
    const blockchain = await rpcCall('getblockchaininfo');
    res.json(blockchain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/peers', async (req, res) => {
  try {
    const peers = await rpcCall('getpeerinfo');
    res.json(peers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mempool', async (req, res) => {
  try {
    const mempool = await rpcCall('getmempoolinfo');
    res.json(mempool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await rpcCall('getblockcount');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DigiByte Umbrel Web Interface running on port ${PORT}`);
  console.log(`📡 Connected to DigiByte node at ${RPC_CONFIG.host}:${RPC_CONFIG.port}`);
  console.log(`🌐 Access the dashboard at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Received SIGINT, shutting down gracefully');
  process.exit(0);
});