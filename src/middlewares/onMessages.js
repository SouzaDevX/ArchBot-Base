/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/


const { dynamicCommand } = require("../lib/dynamicCommand");
const { contentMsg } = require("../lib/contentMsg");

// Ação ao receber uma mensagem
exports.onMessages = async (client, m) => {
  // Adicionando informações adicionais no objeto de mensagem/client
  m = await contentMsg(client, m);

  // Executar o comando
  await dynamicCommand(client,m)
};
