exports.checkPermission = async ({ type, sender, from, client, msg }) => {
  //Verificações
  const chat = await client.getChatById(from);
  const isGroup = from.endsWith("@g.us");
  const participants = isGroup ? chat.groupMetadata.participants : [];
  const groupAdmins = isGroup
    ? participants
        .filter((v) => v.isAdmin || v.isSuperAdmin)
        .map((v) => v.id._serialized)
    : [];
  const isBotAdmin = isGroup
    ? groupAdmins.includes(client.info.wid._serialized)
    : false;
  const isAdmin = isGroup ? groupAdmins.includes(sender) : false;

  switch (type) {
    case "member":
      return { value: true };

    case "group":
      return {
        value: isGroup,
        msg: "Esta ação só pode ser executada em grupos.",
      };

    case "admin":
      if (!isGroup) {
        return {
          value: false,
          msg: "Esta ação só pode ser executada em grupos.",
        };
      } else if (!isAdmin) {
        return {
          value: false,
          msg: "Você não é um administrador deste grupo.",
        };
      } else if (!isBotAdmin) {
        return {
          value: false,
          msg: "O bot não é um administrador deste grupo.",
        };
      } else {
        return { value: true };
      }

    case "owner":
      return {
        value: sender === global.OWNER_NUMBER + "@c.us",
        msg: "Esta ação só pode ser executada pelo meu criador.",
      };

    default:
      return {
        value: false,
        msg: "Você não tem permissão para executar este comando.",
      };
  }
};
