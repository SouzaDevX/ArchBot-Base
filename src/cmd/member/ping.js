const moment = require("moment-timezone");
const processsTime = (timestamp) => {
  return moment
    .duration(moment() - moment(timestamp * 1000))
    .asSeconds()
    .toFixed(2);
};

module.exports = {
  alias: ["ping", "pong"], // Também pode ser um array para múltiplos comandos com mesma ação.
  // Você pode adicionar outros parametros, se desejar.

  async start() {
    const { m } = this;
    const timestamp = processsTime(m.timestamp);
    m.reply(`Pong! ${timestamp}ms`);
  },

  async error() {
    // Ação em casos de erros (Opcional)
    // const { m, client } = this;
    // ↑ Tudo que você precisa está vinculado ao this
  },

  async end() {
    // Ação ao terminar de executar o comando (Opcional)
    // const { m, client } = this;
    // ↑ Tudo que você precisa está vinculado ao this
  },
};
