const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const url = env.split('\n').find(l => l.startsWith('SUPABASE_URL=')).split('=')[1].trim().replace(/"/g, '');
const key = env.split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')).split('=')[1].trim().replace(/"/g, '');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
fetch(url + '/rest/v1/User?select=name,passwordHash', {
    headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
    }
}).then(res => res.json()).then(console.log).catch(console.error);
