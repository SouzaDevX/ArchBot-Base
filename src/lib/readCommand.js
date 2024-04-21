/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/

const { bold } = require("cli-color");
const fs = require("fs");
const path = require("path");

class ReadCommands {
  constructor(options) {
    this.pasta = options.pasta;
    this.logs = options.logs;
    this.commandImports = null
  }

  log(text) {
    if (this.logs) {
      console.log(bold("[LOGS]"), text);
    }
  }

  readCommand(command) {
    let typeReturn = "";
    let targetCommandReturn = null;

    for (const [type, commands] of Object.entries(this.commandImports)) {
      if (!commands.length) {
        continue;
      }

      const targetCommand = commands.find((cmd) => Array.isArray(cmd.alias) ? cmd.alias.includes(command) : cmd.alias === command);

      if (targetCommand) {
        typeReturn = type;
        targetCommandReturn = targetCommand;
      }
    }

    if (targetCommandReturn) {
      this.log(`Comando encontrado! "${command}" de "${typeReturn}"`);
    } else {
      this.log(`Nenhum comando encontrado para "${command}"!`);
    }

    return {
      type: typeReturn,
      command: targetCommandReturn,
    };
  }

  readFiles() {
    const subdirectories = fs
      .readdirSync(this.pasta, {
        withFileTypes: true,
      })
      .filter((directory) => directory.isDirectory())
      .map((directory) => directory.name);

    const commandImports = {};

    for (const subdir of subdirectories) {
      const subdirectoryPath = path.join(this.pasta, subdir);
      const files = fs
        .readdirSync(subdirectoryPath)
        .filter((file) => !file.startsWith("_") && (file.endsWith(".js") || file.endsWith(".ts")))
        .map((file) => {
          const data = require(path.join(subdirectoryPath, file));
          data.category = file.includes("-") ? file.split("-")[0] : "other";
          if (Array.isArray(data)) {
            const commands = [];
            for (const cmd of data) {
              commands.push({
                ...cmd,
                category: file.includes("-") ? file.split("-")[0] : "other",
              });
            }
            return commands;
          }
          return data;
        });
    
      const flattenedFiles = files.flat();
      commandImports[subdir] = flattenedFiles;
    }
  
    if (this.commandImports) {
      this.log(`Comandos recarregados: ${Object.values(commandImports).reduce((total, commands) => total + commands.length, 0)}`);
    } else {
      this.log(`Comandos carregados: ${Object.values(commandImports).reduce((total, commands) => total + commands.length, 0)}`);
    }

    this.commandImports = commandImports;
  }
}

module.exports = ReadCommands;
