/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/


const connect = require("./connection");
const load = require("./loader");
// const path = require("path");



async function start() {
  const client = await connect(); // Conectando client
  await load(client); // Carregando eventos
}

start();
