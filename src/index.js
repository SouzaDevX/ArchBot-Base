const { connect } = require("./connection");
const { load } = require("./loader");
const { startWatcher } = require("./utils/watcher");

async function start() {
  const client = await connect();
  await load(client);
  await startWatcher();
}

start();
