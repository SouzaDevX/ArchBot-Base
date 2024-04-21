/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/

const { config } = require("../config");
const urlRegex = require("url-regex");

const regex = urlRegex({ strict: false });

exports.contentMsg = async (client, m) => {
  // Adicionando informações adicionais no objeto de mensagem
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

  m.reply = async (content) => {
    await client.sendMessage(m.from, content, {
      quotedMessageId: m.id._serialized,
    });
  };

  return m;
};
