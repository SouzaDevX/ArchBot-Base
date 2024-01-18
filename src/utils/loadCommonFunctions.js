const { MessageMedia } = require("whatsapp-web.js");
const { extractDataFromMessage, delay, onlyNumbers } = require(".");
const { GlobalError } = require("../errors/GlobalError");

exports.loadCommonFunctions = async (client, msg) => {
  const data = await extractDataFromMessage({ msg });
  const {
    sender,
    from,
    commandName,
    args,
    PREFIX,
    quoted,
    argg,
    isGroup,
    thisPrefix,
  } = data;

  const chat = await msg.getChat();

  let bot = {};

  bot.downloadMedia = async (msg, quoted, allowedTypes) => {
    const isTypeAllowed = (type) => allowedTypes.includes(type);

    let sourceMessage = null;

    if (msg.hasMedia) {
      sourceMessage = msg;
    } else if (msg.hasQuotedMsg && quoted.hasMedia) {
      sourceMessage = quoted;
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

  bot.getProfilePic = async (id) => {
    const pfp = await client.getProfilePicUrl(id);
    return pfp
      ? pfp
      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  };

  bot.getName = async (id) => {
    const contact = await client.getContactById(id);
    const pushname = contact.pushname || contact.shortName || contact.name;
    return pushname;
  };

  bot.getJid = async (msge) => {
    if (!msge) return false;

    if (msge.id.remote.endsWith("@g.us")) {
      return msge.id.participant._serialized;
    } else {
      return msg.author || msg.id.remote;
    }
  };

  bot.react = async (emoji) => {
    await msg.react(emoji);
    await delay(300);
  };

  bot.send = async ({
    text,
    react,
    reply = true,
    detectMentions,
    options,
    to = from,
  }) => {
    if (react) {
      await msg.react(react);
      await delay(500);
    }

    if (!text) return;

    if (detectMentions) {
      const mentions = text.match(/@(\d+)/g) || [];
      const mentioneds = await Promise.all(
        mentions.map(async (mention) => {
          const username = mention.substring(1);
          const number = onlyNumbers(username) + "@c.us";
          const isRegistered = await client.isRegisteredUser(number);
          if (isRegistered) {
            return number;
          }
        })
      );

      if (mentioneds.length > 0) {
        await client.sendMessage(to, text, {
          mentions: mentioneds,
          quotedMessageId: reply ? msg.id._serialized : "",
          ...options,
        });
        return;
      }
    }

    await client.sendMessage(to, text, {
      quotedMessageId: reply ? msg.id._serialized : null,
      ...options,
    });
  };

  bot.sendMedia = async ({
    media,
    url,
    buffer,
    file,
    type,
    filename,
    options,
    reply = true,
  }) => {
    let mediaObject;

    if (media) {
      mediaObject = media;
    } else if (url) {
      mediaObject = await MessageMedia.fromUrl(url, {
        unsafeMime: true,
        filename: filename ? filename : "Resultado",
      });
    } else if (buffer) {
      mediaObject = new MessageMedia(
        type,
        buffer,
        filename ? filename : "Resultado"
      );
    } else if (file) {
      mediaObject = MessageMedia.fromFilePath(file);
    }

    const checkBUFF = Buffer.from(mediaObject.data, "base64");

    const pesoEmBytes = checkBUFF.length;

    mediaObject.filesize = pesoEmBytes;

    if (mediaObject.filesize > 50000000) {
      throw new GlobalError(
        "O arquivo recebido para enviar é muito grande. O tamanho máximo permitido é de 50 MB."
      );
    }

    let mess;

    if (mediaObject.filesize > 25000000 || !mediaObject.filesize) {
      console.log("Excedeu o limite.. Enviando como arquivo!");
      const mesi = await client.sendMessage(from, mediaObject, {
        quotedMessageId: reply ? msg.id._serialized : null,
        mimetype: type,
        sendMediaAsDocument: true,
        ...options,
      });
      return mesi;
    }

    mess = await client
      .sendMessage(from, mediaObject, {
        quotedMessageId: reply ? msg.id._serialized : null,
        mimetype: type,
        ...options,
      })
      .catch(async () => {
        mess = await client.sendMessage(from, mediaObject, {
          quotedMessageId: reply ? msg.id._serialized : null,
          mimetype: type,
          sendMediaAsDocument: true,
          ...options,
        });
      });
    return mess;
  };

  return {
    //Informações da Mensagem
    client,
    chat,
    msg,
    sender,
    from,
    commandName,
    args,
    quoted,
    PREFIX,
    arg: args.join(" "),
    argg,
    isGroup,
    thisPrefix,
    //Funções
    bot,
  };
};
