exports.expandClient = (client, m) => {
  // Aqui você pode adicionar funções para expandir o objeto 'client', também pode modificar as funções existentes.

  // Exemplo simples:
  client.sendMess = async (chatId, txt) => {
    await client.sendMessage(chatId, txt);
  };

  return client;
};
