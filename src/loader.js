const { onMessages } = require("./middlewares/onMessages");

exports.load = async (client) => {
  client.on("message", async (msg) => {
    await onMessages(client, msg);
  });

  client.on("message_edit", async (msg) => {
    if (msg.fromMe) return;

    await onMessages(client, msg);
  });
};
