const { sendTelegramAlert } = require('./src/actions/sendTelegramAlert');
require('dotenv').config();

async function run() {
  const result = await sendTelegramAlert('Test message from script');
  console.log(result);
}
run();
