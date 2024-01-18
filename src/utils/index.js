const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const moment = require("moment-timezone");
const axios = require("axios");
const urlRegex = require("url-regex");
const { PREFIXES, COMMANDS_DIR } = require("../config");

exports.extractDataFromMessage = async ({ msg }) => {
  const isGroup = msg.from.endsWith("@g.us");
  let thisPrefix;

  thisPrefix = "'";

  const matchedPrefix =
    thisPrefix instanceof RegExp
      ? (msg.body.match(thisPrefix) || [])[0]
      : msg.body.substring(0, thisPrefix.length);

  const PREFIX = matchedPrefix !== undefined ? matchedPrefix : "";

  const args = msg.body.slice(PREFIX?.length).trim().split(/ +/g);
  const commandName = args
    .shift()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split("\n")[0];

  const argg = msg.body
    .slice((PREFIX + commandName).length + 1)
    .replace(/\n/, "\n");

  const sender = msg.from.endsWith("@g.us")
    ? msg.id.participant
    : msg.author || msg.id.remote || null;
  const quoted = (await msg.getQuotedMessage()) || null;

  return {
    from: msg.from,
    sender,
    args,
    commandName: this.formatCommand(commandName),
    PREFIX,
    quoted,
    argg,
    isGroup,
    thisPrefix,
  };
};

exports.splitByCharacters = (str, characters) => {
  characters = characters.map((char) => (char === "\\" ? "\\\\" : char));
  const regex = new RegExp(`[${characters.join("")}]`);

  return str
    .split(regex)
    .map((str) => str.trim())
    .filter(Boolean);
};

exports.formatCommand = (text) => {
  return this.removeAccentsAndSpecialCharacters(
    text.toLocaleLowerCase().replace("\n", "").trim()
  );
};

exports.onlyLettersAndNumbers = (text) => {
  return text.replace(/[^a-zA-Z0-9]/g, "");
};

exports.removeAccentsAndSpecialCharacters = (text) => {
  if (!text) return "";

  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

exports.findCommandImport = async (commandName) => {
  const command = await this.readCommandImports();

  let typeReturn = "";
  let targetCommandReturn = null;

  for (const [type, commands] of Object.entries(command)) {
    if (!commands.length) {
      continue;
    }

    const targetCommand = commands.find((cmd) =>
      cmd.commands.map((cmd) => this.formatCommand(cmd)).includes(commandName)
    );

    if (targetCommand) {
      typeReturn = type;
      targetCommandReturn = targetCommand;
    }
  }

  return {
    type: typeReturn,
    command: targetCommandReturn,
  };
};

exports.readCommandImports = async () => {
  const subdirectories = fs
    .readdirSync(COMMANDS_DIR, { withFileTypes: true })
    .filter((directory) => directory.isDirectory())
    .map((directory) => directory.name);

  const commandImports = {};

  for (const subdir of subdirectories) {
    const subdirectoryPath = path.join(COMMANDS_DIR, subdir);
    const files = fs
      .readdirSync(subdirectoryPath)
      .filter(
        (file) =>
          !file.startsWith("_") &&
          (file.endsWith(".js") || file.endsWith(".ts"))
      )
      .map((file) => require(path.join(subdirectoryPath, file)));

    commandImports[subdir] = files;
  }

  return commandImports;
};

exports.onlyNumbers = (text) => text.replace(/\D/g, "");

exports.toUserJid = (number) => `${this.onlyNumbers(number)}@c.us`;

exports.delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

exports.getBuffer = async (url, isBase64 = true) => {
  const response = await axios({
    method: "get",
    url,
    headers: {
      DNT: 1,
      "Upgrade-Insecure-Request": 1,
    },
    responseType: "arraybuffer",
  });

  if (isBase64) {
    const buffer = Buffer.from(response.data, "binary");
    const base64 = buffer.toString("base64");
    return base64;
  } else {
    return response.data;
  }
};

exports.isUrl = (text) => {
  const regex = urlRegex({ strict: false });
  return regex.test(text);
};

exports.formatTime = (durationInSeconds, curto = false) => {
  const years = Math.floor(durationInSeconds / (3600 * 24 * 365));
  durationInSeconds -= years * 3600 * 24 * 365;

  const months = Math.floor(durationInSeconds / (3600 * 24 * 30));
  durationInSeconds -= months * 3600 * 24 * 30;

  const days = Math.floor(durationInSeconds / (3600 * 24));
  durationInSeconds -= days * 3600 * 24;

  const hours = Math.floor(durationInSeconds / 3600);
  durationInSeconds -= hours * 3600;

  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  let formattedDuration = "";

  if (years > 0) {
    formattedDuration += `${
      curto ? `${years}a` : `${years} ano${years > 1 ? "s" : ""}`
    } `;
  }
  if (months > 0) {
    formattedDuration += `${
      curto ? `${months}m` : `${months} mês${months > 1 ? "es" : ""}`
    } `;
  }
  if (days > 0) {
    formattedDuration += `${
      curto ? `${days}d` : `${days} dia${days > 1 ? "s" : ""}`
    } `;
  }
  if (hours > 0) {
    formattedDuration += `${
      curto ? `${hours}h` : `${hours} hora${hours > 1 ? "s" : ""}`
    } `;
  }
  if (minutes > 0) {
    formattedDuration += `${
      curto ? `${minutes}m` : `${minutes} minuto${minutes > 1 ? "s" : ""}`
    } `;
  }
  if (seconds > 0) {
    formattedDuration += `${
      curto ? `${seconds}s` : `${seconds} segundo${seconds > 1 ? "s" : ""}`
    } `;
  }

  return formattedDuration.trim();
};

exports.randomString = (length) => crypto.randomBytes(length).toString("hex");

exports.fetchJson = async (url, options) => {
  try {
    options ? options : {};
    const res = await axios({
      method: "GET",
      url: url,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
      },
      ...options,
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

exports.getDate = () => {
  return moment.tz("America/Sao_Paulo");
};

exports.hasTypeOrCommand = ({ type, command }) => type && command;

exports.verifyPrefix = (prefix, thisPrefix) => {
  if (thisPrefix instanceof RegExp) {
    return thisPrefix.test(prefix);
  } else {
    return thisPrefix === prefix;
  }
};
