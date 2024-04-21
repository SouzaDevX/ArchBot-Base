/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/

const { red } = require("cli-color");
const { config } = require("../config");
const ReadCommand = require("../lib/readCommand");
const chokidar = require("chokidar");
const natural = require("natural");

const cmds = new ReadCommand({
  pasta: config.commandPath, // Pasta com os comandos
  logs: true, // Habilitar logs
});

cmds.readFiles(); // Renderizar arquivos

const watcher = chokidar.watch(config.commandPath, {
  persistent: true,
});

watcher.on("change", (path) => {
  delete require.cache[require.resolve(path)];
  require(path);
  console.log(`\x1b[36m[WATCHER]\x1b[0m Alterado e Atualizado - ${path}`);
  cmds.readFiles();
});

watcher.on("unlink", (path) => {
  console.log(`\x1b[36m[WATCHER]\x1b[0m Removido - ${path}`);
  cmds.readFiles();
});

exports.dynamicCommand = async (client, m) => {
  if (!m.prefix?.length) {
    return;
  }

  const isCmd = await cmds.readCommand(m.cmd);

  const toBind = {
    m,
    client,
  }; // Objetos que queira vincular ao "this", utilizado no handler.

  if (isCmd.command && "start" in isCmd.command) {
    try {
      await isCmd.command.start.bind({ ...toBind })(); // Chama a função start e aguarda sua conclusão
      if ("end" in isCmd.command) {
        await isCmd.command.end.bind({ ...toBind })(); // Ação que pode ser executada ao terminar de executar o comando
      }
    } catch (error) {
      console.error(red("[ERROR]"), error);
      // Executando ação de erro, caso esteja definido no handler.
      if ("error" in isCmd.command) {
        await isCmd.command.error.bind({ ...toBind })();
      } else {
        // Caso não tenha nenhuma ação de erro, será executada a ação padrão.
        m.reply("Ocorreu um erro ao executar o comando.");
      }
    }
  } else {
    // Ação caso o comando requerido não exista
    // Certifique-se de que cmds e m estejam definidos corretamente antes deste trecho de código

    const allAliases = Object.values(cmds.commandImports).reduce((names, category) => {
      category.forEach((command) => {
        names.push(...(Array.isArray(command.alias) ? command.alias : [command.alias]));
      });
      return names;
    }, []);

    const mostSimilarCommands = findMostSimilarCommand(m.cmd, allAliases);

    if (mostSimilarCommands.length) {
      const otherSimilarCommands = mostSimilarCommands.map(({ name, similarity }) => `- Comando: ${name}\n- Similaridade: ${similarity}%\n`).join("*—*\n");
      m.reply(`Ops! Parece que você digitou um comando inexistente. 🥴

*• Mas há alguns similares:*
*—*
${otherSimilarCommands}`);
    } else {
      // m.reply(`Comando "${m.cmd}" não encontrado.`);
    }
  }
};

function findMostSimilarCommand(inputCommand, validCommands) {
  const mostSimilarCommands = [];

  validCommands.forEach((command) => {
    const distance = natural.LevenshteinDistance(inputCommand, command);
    const similarity = (1 - distance / Math.max(inputCommand.length, command.length)) * 100;

    if (similarity >= 60) {
      mostSimilarCommands.push({ name: command, similarity: similarity.toFixed(2) });
    }
  });

  mostSimilarCommands.sort((a, b) => b.similarity - a.similarity);

  return mostSimilarCommands;
}
