/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/


const { onMessages } = require("./middlewares/onMessages");

// Carregando Eventos
module.exports = async (client) => {
  client.on("message_create", async (m) => {
    if (m.fromMe) return;
    await onMessages(client, m);
  });

  client.on("message_edit", async (m) => {
    if (m.fromMe) return;
    await onMessages(client, m);
  });
};
