/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/

// Exemplo de como funciona a criação de comandos

// Forma 1

module.exports = {
  alias: "comando", // Também pode ser um array para múltiplos comandos com mesma ação.
  // Você pode adicionar outros parametros, se desejar.

  async start() {
    // Ação ao iniciar o comando  (Obrigatório)
    // const { m, client } = this;
    // ↑ Tudo que você precisa está vinculado ao this
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

/* 
-- Forma 2
-- Múltiplos comandos em apenas um único arquivo, saiba que mesmo estando no mesmo arquivo, eles são independentes um do outro.
*/

module.exports = [
  {
    alias: "comando",
    async start() {},
  },
  {
    alias: "comando2",
    async start() {},
  },
];
