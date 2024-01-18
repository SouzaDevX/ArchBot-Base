const colors = require("ansi-colors");
const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
// const { simiAction } = require("../services/simi");
// const { playAction } = require("../utils/playAction");
const { checkSpam } = require("../utils/checkSpam");

exports.onMessages = async (client, msg) => {
  if (await checkSpam(msg)) {
    return;
  }

  const commonFunctions = await loadCommonFunctions(client, msg);

  await dynamicCommand(commonFunctions);

  //   await simiAction(commonFunctions);

  //   await playAction(commonFunctions);

  const senderName = await commonFunctions.bot.getName(commonFunctions.sender);
  const fromName = await commonFunctions.bot.getName(commonFunctions.from);

  console.log(
    `[${colors.underline("MSG")}] ${colors.magentaBright(
      ` ${commonFunctions.sender.split("@")[0]} (${senderName})`
    )} ${colors.blueBright("to")} ${colors.greenBright(
      `${commonFunctions.from} (${fromName})`
    )} | ${colors.bgYellow.black(
      commonFunctions.msg.type
    )} - ${colors.whiteBright(msg.body)} `
  );
};
