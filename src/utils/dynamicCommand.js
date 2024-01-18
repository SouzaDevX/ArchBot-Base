const { DangerError } = require("../errors/DangerError");
const { InvalidParameterError } = require("../errors/InvalidParameterError");
const { WarningError } = require("../errors/WarningError");
const { hasTypeOrCommand, verifyPrefix, findCommandImport } = require(".");
const { checkPermission } = require("../utils/checkPermission");
const { GlobalError } = require("../errors/GlobalError.js");

const {
  isFiltered,
  addFilter,
  addSpamWarning,
  isSpamWarning,
} = require('../utils/checkSpam.js')
const { OWNER_NUMBER } = require("../config.js");

exports.dynamicCommand = async (paramsHandler) => {
  const {
    commandName,
    PREFIX,
    sendText,
    client,
    bot,
    thisPrefix,
    msg,
    sender,
    isGroup,
  } = paramsHandler;
  const { type, command } = await findCommandImport(commandName);
  const checkedPermission = await checkPermission({ type, ...paramsHandler });

  if (!verifyPrefix(PREFIX, thisPrefix)) {
    return;
  }

  if (!hasTypeOrCommand({ type, command })) {
    if (commandName.length > 1 && !commandName.includes(PREFIX)) {
      await bot.react("❔");
    }
    return;
  }

  if (isFiltered(sender) && msg.body.startsWith(PREFIX)) {
    if (!isSpamWarning(sender)) {
      addSpamWarning(sender);
      msg.reply("• Calma aí! Aguarde um pouco antes de enviar outro comando.");
    }
    return;
  }

  if (checkedPermission?.value !== true) {
    await bot.send({
      text:
        checkedPermission?.msg ||
        "Você não tem permissão para executar este comando!",
    });
    return;
  }

  try {
    if (!sender.startsWith(OWNER_NUMBER)) {
      await addFilter(sender);
    }

    if (sender.startsWith(OWNER_NUMBER) || command.isPv || isGroup) {
      await command.handle({
        type,
        ...paramsHandler,
      });
    } else {
      throw new GlobalError(
        `🔐 Este é um bot privado. Infelizmente, você não tem permissão para acessar. 😔\n\n• *${PREFIX}menu*\n  › _Confira os comandos disponíveis_\n\n• *${PREFIX}alugar*\n  › _Leve todas essas funcionalidades para o seu grupo! Alugue-me e aproveite!_ 💫\n\n• *Acesse o grupo oficial do bot, e utilize os comandos de forma gratuita:*\n  › https://chat.whatsapp.com/LYQNOmib8SXGzj1dLI4oZi \n\n🚀 *Descubra as possibilidades com mais de 200 funções!* 💡\n🤖✨ _Desde figurinhas, downloads de músicas e vídeos, administração de grupos, criação de logos, e muito mais!_`,
        "🔐"
      );
    }
  } catch (error) {
    console.log(error);

    if (error instanceof InvalidParameterError) {
      await bot.send({
        text: `• ${error.message}\n › Para mais informações, digite ${PREFIX}info ${commandName}`,
        react: "⚠️",
      });
    } else if (error instanceof WarningError) {
      await bot.send({ text: `⚠️ ${error.message}`, react: "⚠️" });
    } else if (error instanceof DangerError) {
      await bot.send({ text: `❌ ${error.message}`, react: "❌" });
    } else if (error instanceof GlobalError) {
      await bot.send({ text: `${error.message}`, react: error.react });
    } else {
      await bot.send({
        text: `*Não foi possível executar o comando.* Tente novamente mais tarde.`,
        react: "😿",
      });
    }
  }
};
