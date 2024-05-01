/*
  • Instagram: @ind0minous
  • Repositório: https://github.com/neb6la/ArchBot-Base
*/

const { config } = require("../config");
const urlRegex = require("url-regex");

const regex = urlRegex({ strict: false });

exports.contentMsg = async (client, m) => {
  // Adicionando informações adicionais no objeto de mensagem
  m.fakeObj = { ...m };
  m.isGroup = m.from.endsWith("@g.us");
  m.sender = m.isGroup ? m.id.participant : m.id.remote;
  m.user = m.sender.split("@")[0];
  m.text = m.body;
  m.prefix = config.prefix instanceof RegExp ? (m.text.match(config.prefix) || [])[0] : m.text.charAt(0) === config.prefix ? m.text.substring(0, config.prefix.length) : undefined;
  m.args = m.text.slice(m.prefix?.length).trim().split(/ +/g);
  m.cmd = m.args
    .shift()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split("\n")[0];
  m.arg = m.text.slice((m.prefix + m.cmd).length + 1).replace(/\n/, "\n");
  m.quoted = await m.getQuotedMessage();
  const match = regex.exec(m.text) || regex.exec(m.quoted?.body);
  m.matchUrl = match ? match[0] : null;
  m.contact = await client.getContactById(m.sender);
  m.pushname = m.contact.pushname || m.contact.name || (await client.getFormattedNumber(m.sender));

  m.reply = async (content, ops = {}) => {
    console.log("Enviando mensagem para: ", ops.from || m.from);
    return await client.sendMess(ops.from || m.from, content, { quoted: m.id._serialized, ...ops });
  };

  m.getMedia = async (allowedTypes) => {
    const isTypeAllowed = (type) => allowedTypes.includes(type);

    let sourceMessage = null;

    if (m.hasMedia) {
      sourceMessage = m;
    } else if (m.hasQuotedMsg && m.quoted.hasMedia) {
      sourceMessage = m.quoted;
    }

    if (!sourceMessage || !isTypeAllowed(sourceMessage.type)) {
      return false;
    }

    const media = await sourceMessage.downloadMedia();
    media.type = sourceMessage.type;
    media.duration = sourceMessage.duration;
    media.isMedia = sourceMessage.hasMedia;
    media.msg = sourceMessage;

    return media;
  };

  return m;
};
