const chokidar = require("chokidar");
const { resolve } = require("path");
const { COMMANDS_DIR, ASSETS_DIR } = require("../config");

exports.startWatcher = async () => {
  const fileWatcher = chokidar.watch(COMMANDS_DIR, {
    ignored: /(^|[/\\])node_modules|(^|[/\\])\.wwebjs|(^|[/\\])temp($|[/\\])/,
    persistent: true,
  });

  fileWatcher
    .on("ready", () => {
      console.log("\x1b[36m[WATCHER]\x1b[0m Iniciado..");
    })
    .on("change", (path) => {
      console.log(`\x1b[36m[WATCHER]\x1b[0m Alterado e Atualizado - ${path}`);
      // if (path.includes("assets/messages/menus.js")) {
      //   console.log(
      //     `\x1b[36m[WATCHER]\x1b[0m Atualizado automaticamente - ${resolve(
      //       ASSETS_DIR,
      //       "messages",
      //       "menus.js"
      //     )}`
      //   );
      //   clearCache(resolve(ASSETS_DIR, "messages", "menus.js"));
      // }
      clearCache(resolve(path));
    });
};

function clearCache(path) {
  try {
    delete require.cache[require.resolve(path)];
  } catch (error) {
    console.error(
      `\x1b[36m[WATCHER]\x1b[0m Erro ao recarregar comando - ${path}:`,
      error
    );
  }
}
