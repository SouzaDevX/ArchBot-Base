/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/

const path = require("path");

exports.config = {
  commandPath: path.join(__dirname, "cmd"),
  assetPath: path.join(__dirname, "..", "asset"),
  prefix: /^[°•π÷×¶∆£¢€¥®™+✓_=/|~!?#$%^&.©^]/gi, // Pode ser uma string para prefixo único ou regex para multi-prefixos.
};
