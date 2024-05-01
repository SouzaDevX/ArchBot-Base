/* eslint-disable new-cap */
const { MessageMedia } = require("whatsapp-web.js");
const { onlyNumbers } = require("./function");
const { CommonError } = require("../errors/CommonError");
const { green } = require("cli-color");
const { fileTypeFromBuffer } = require("fix-esm").require("file-type");

exports.expandClient = (client) => {
  // Aqui você pode adicionar funções para expandir o objeto 'client', também pode modificar as funções existentes.

  // Exemplo simples:
  client.sendMess = async (chatId, txt, ops = {}) => {
    const defaultOptions = {
      mentions: true,
    };

    const options = { ...defaultOptions, ...ops };

    if (options.mentions === true) {
      const matchedMentions = txt.match(/@(\d+)/g) || [];
      const mentions = await Promise.all(
        matchedMentions.map(async (mention) => {
          const username = mention.substring(1);
          const number = onlyNumbers(username) + "@c.us";
          const isRegistered = await client.isRegisteredUser(number);
          if (isRegistered) {
            return number;
          }
        }),
      );

      options.mentions = mentions.filter((m) => m);
    }

    if (options.quoted) {
      options.quotedMessageId = options.quoted;
    }

    if (options.media) {
      let { url, file, buffer, media, type } = options.media;

      let mediaObj;

      if (url) {
        mediaObj = await MessageMedia.fromUrl(url);
      } else if (file) {
        mediaObj = await MessageMedia.fromFilePath(file);
      } else if (buffer) {
        if (!type || type === "auto") {
          fileTypeFromBuffer(Buffer.from(buffer)).then((typeRes) => {
            type = typeRes.mime;
          });
        }
        mediaObj = new MessageMedia(type, buffer);
      } else if (media) {
        mediaObj = media;
      }

      if (mediaObj) {
        options.caption = txt;
        txt = mediaObj;

        if (!mediaObj.filesize || isNaN(mediaObj.filesize)) {
          const checkBUFF = Buffer.from(mediaObj.data, "base64");

          const pesoEmBytes = checkBUFF.length;

          mediaObj.filesize = pesoEmBytes;
        }

        if (mediaObj.filesize > 50000000) {
          throw new CommonError("O arquivo recebido para enviar é muito grande. O tamanho máximo permitido é de 50 MB.");
        }

        if (mediaObj.filesize > 25000000 || !mediaObj.filesize) {
          console.log(`${green("[MESSAGE_MEDIA]")} Excedeu o limite.. Enviando como arquivo!`);
          options.sendMediaAsDocument = true;
        }
      }
    }

    return await client.sendMessage(chatId, txt, { ...options });
  };

  return client;
};
