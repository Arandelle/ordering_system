// ============================================================
// MongoDB Direct Connection String Generator
// ============================================================
// PURPOSE: This script converts mongodb+srv:// URIs to direct 
// mongodb:// connection strings when DNS SRV lookups fail.
//
// WHEN TO USE:
// - When you get "querySrv ECONNREFUSED" errors
// - When switching to a new MongoDB Atlas cluster
// - When your ISP blocks MongoDB SRV record lookups
//
// HOW TO USE:
// 1. Get your mongodb+srv:// URI from MongoDB Atlas
// 2. Replace the URI in STEP 1 below
// 3. Run: node get-connection.js
// 4. Copy the output to your .env file
// ============================================================

const dns = require('dns').promises;

async function getConnectionString() {
  try {
    // --------------------------------------------------------
    // STEP 1: PASTE YOUR MONGODB+SRV:// URI HERE
    // --------------------------------------------------------
    // Get this from: MongoDB Atlas → Connect → Connect your application
    // Example format: mongodb+srv://username:password@cluster.mongodb.net/?options
    
    const srvUri = "mongodb+srv://iseebugs:iseebugs@iseebugs.upltkf5.mongodb.net/?appName=iseebugs";
    
    // --------------------------------------------------------
    // STEP 2: EXTRACT THE CLUSTER HOSTNAME
    // --------------------------------------------------------
    // Parse the SRV URI to get just the cluster hostname
    // Format: _mongodb._tcp.CLUSTER_HOSTNAME
    
    const match = srvUri.match(/mongodb\+srv:\/\/[^@]+@([^\/\?]+)/);
    if (!match) {
      throw new Error('Invalid SRV URI format');
    }
    const clusterHost = match[1];
    console.log(`📍 Cluster: ${clusterHost}\n`);
    
    // --------------------------------------------------------
    // STEP 3: EXTRACT USERNAME AND PASSWORD
    // --------------------------------------------------------
    const credMatch = srvUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
    const username = credMatch ? credMatch[1] : 'username';
    const password = credMatch ? credMatch[2] : 'password';
    
    // --------------------------------------------------------
    // STEP 4: EXTRACT DATABASE NAME (if present)
    // --------------------------------------------------------
    const dbMatch = srvUri.match(/\.net\/([^\?]+)/);
    const database = dbMatch && dbMatch[1] ? dbMatch[1] : '';
    
    // --------------------------------------------------------
    // STEP 5: EXTRACT QUERY PARAMETERS (optional)
    // --------------------------------------------------------
    const paramsMatch = srvUri.match(/\?(.+)$/);
    const queryParams = paramsMatch ? paramsMatch[1] : '';
    
    // --------------------------------------------------------
    // STEP 6: USE GOOGLE DNS FOR RELIABLE SRV LOOKUPS
    // --------------------------------------------------------
    // Set DNS servers to Google's public DNS (8.8.8.8, 8.8.4.4)
    // This bypasses your ISP's DNS which might block MongoDB lookups
    
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('🔍 Using Google DNS (8.8.8.8) for SRV lookup...\n');
    
    // --------------------------------------------------------
    // STEP 7: QUERY SRV RECORDS TO GET ACTUAL HOSTNAMES
    // --------------------------------------------------------
    // MongoDB uses SRV records to store the actual server addresses
    // Format: _mongodb._tcp.CLUSTER_HOST
    
    const srvLookup = `_mongodb._tcp.${clusterHost}`;
    console.log(`🔎 Looking up: ${srvLookup}\n`);
    
    const records = await dns.resolveSrv(srvLookup);
    
    // --------------------------------------------------------
    // STEP 8: BUILD COMMA-SEPARATED HOST LIST
    // --------------------------------------------------------
    // MongoDB replica sets need all hosts listed
    // Format: host1:port,host2:port,host3:port
    
    const hosts = records.map(r => `${r.name}:${r.port}`).join(',');
    
    console.log('✅ Found MongoDB servers:');
    records.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name}:${r.port}`);
    });
    
    // --------------------------------------------------------
    // STEP 9: GET REPLICA SET NAME FROM TXT RECORDS
    // --------------------------------------------------------
    // The replica set name is stored in DNS TXT records
    // This is required for MongoDB to know which replica set to connect to
    
    let replicaSet = 'atlas-xxxxx-shard-0'; // Default fallback
    
    try {
      const txtRecords = await dns.resolveTxt(clusterHost);
      const authSourceTxt = txtRecords.find(r => r.join('').includes('replicaSet='));
      
      if (authSourceTxt) {
        const rsMatch = authSourceTxt.join('').match(/replicaSet=([^&]+)/);
        if (rsMatch) {
          replicaSet = rsMatch[1];
          console.log(`✅ Replica set: ${replicaSet}`);
        }
      }
    } catch (e) {
      console.log('⚠️  Could not auto-detect replica set name, using default');
    }
    
    // --------------------------------------------------------
    // STEP 10: BUILD THE DIRECT CONNECTION STRING
    // --------------------------------------------------------
    // Format: mongodb://username:password@host1:port,host2:port/database?options
    // Required options:
    // - ssl=true: MongoDB Atlas requires encrypted connections
    // - replicaSet=...: Name of the replica set
    // - authSource=admin: Which database to authenticate against
    // - retryWrites=true: Automatically retry failed writes
    // - w=majority: Wait for majority of nodes to acknowledge writes
    
    let connStr = `mongodb://${username}:${password}@${hosts}`;
    
    // Add database name if present
    if (database) {
      connStr += `/${database}`;
    } else {
      connStr += '/';
    }
    
    // Build query parameters
    const params = new URLSearchParams();
    params.set('ssl', 'true');
    params.set('replicaSet', replicaSet);
    params.set('authSource', 'admin');
    params.set('retryWrites', 'true');
    params.set('w', 'majority');
    
    // Add original query parameters if any
    if (queryParams) {
      const originalParams = new URLSearchParams(queryParams);
      for (const [key, value] of originalParams) {
        if (!params.has(key)) {
          params.set(key, value);
        }
      }
    }
    
    connStr += `?${params.toString()}`;
    
    // --------------------------------------------------------
    // STEP 11: OUTPUT THE RESULTS
    // --------------------------------------------------------
    console.log('\n' + '='.repeat(60));
    console.log('🔗 YOUR DIRECT CONNECTION STRING:');
    console.log('='.repeat(60));
    console.log(connStr);
    console.log('='.repeat(60));
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Copy the connection string above');
    console.log('2. Open your .env file');
    console.log('3. Replace MONGODB_URI with this new string');
    console.log('4. Restart your application (npm run dev)');
    console.log('5. Delete this script - you only need it once per cluster\n');
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('1. Make sure your mongodb+srv:// URI is correct');
    console.log('2. Check your internet connection');
    console.log('3. Try changing your DNS to 8.8.8.8 (Google DNS)');
    console.log('4. Verify the cluster exists in MongoDB Atlas\n');
  }
}

// ============================================================
// RUN THE SCRIPT
// ============================================================
getConnectionString();