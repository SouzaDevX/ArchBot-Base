/*
	• Instagram: @ind0minous
	• Repositório: https://github.com/neb6la/ArchBot-Base
*/

const { Client, LocalAuth } = require("whatsapp-web.js");
const qr = require("qrcode-terminal");
const color = require("cli-color");
const { config } = require("./config");
const readline = require("readline");
const path = require("path");
const { onlyNumbers } = require("./lib");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

module.exports = async () => {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "arch", // Nome da pasta da sessão
      dataPath: path.join(config.assetPath, "auth"), // Pasta para salvar sessão
    }),
    puppeteer: {
      /* executablePath: "/usr/bin/chromium-browser",
      -- Geralmente, não é necessário configurar o diretório do navegador.
      */
      executablePath: "/usr/bin/chromium-browser",
      headless: true,
      ignoreDefaultArgs: ["--enable-automation", "--disable-dev-shm-usage"],
      args: ["--no-sandbox", "--disable-gpu", "--disable-setuid-sandbox", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"],
      ignoreHTTPSErrors: true,
    },
    restartOnAuthFail: true,
  });

  let readyCount = 0;

  console.log(color.green("[BROWSER]"), "Acessando Whatsapp Web...");

  let pairingCodeRequested = false;
  client.on("qr", async (data) => {
    if (pairingCodeRequested) return;

    let option;
    do {
      option = await question(color.green("[WWEB]") + ` Escolha o tipo de conexão: ${color.yellowBright("[1]")} QR Code ${color.yellowBright("[2]")} Pairing Code\n`);
    } while (!["1", "2"].includes(option));

    switch (Number(option)) {
      case 1:
        qr.generate(data, {
          small: true,
        });
        console.log(color.green("[WWEB]") + " Escaneie o QR Code acima para conectar");
        break;

      case 2:
        if (!pairingCodeRequested) {
          const number = await question(color.green("[WWEB]") + " Digite o seu número para receber o código: ");
          const pairingCode = await client.requestPairingCode(onlyNumbers(number)); // enter the target phone number
          console.log(color.green("[WWEB]") + " Seu código de conexão é: ", pairingCode);
          console.log(color.green("[WWEB]"), `Escreva o código em: ${color.bold("Aparelhos Conectados > Conectar um novo Aparelho > Conectar usando Número.")}`);
          pairingCodeRequested = true;
        }
    }
  });

  client.on("ready", async () => {
    if (readyCount > 0) return;
    readyCount++;
    console.log("\x1b[32m[WWEB]\x1b[0m ArchBot Online!");

    // Testando se o Client é Official
    const page = client.pupPage;
    const json = await page.evaluate(() => {
      return require("WAWebIsOfficialClient");
    });

    console.log(color.green("[WWEB]"), json.isOfficialClient ? "Sua conexão é Segura." : "Ops! Parece que sua conexão não é segura, o Whatsapp detectou automação em sua conta.");
  });

  let lastStatus;

  client.on("loading_screen", async (status) => {
    if (readyCount > 0) return;

    if (lastStatus === status) return;
    lastStatus = status;

    console.log(color.green("[WWEB]") + " Carregando página... " + status + "%");
  });

  client.on("change_state", (status) => {
    console.log(color.green("[WWEB]"), color.yellowBright("Sessão modificada: "), status);
  });

  client.on("auth_failure", (reason) => {
    console.log(color.green("[WWEB]"), color.redBright("Falha na autenticação: "), reason);
  });

  client.on("disconnected", (reason) => {
    console.log(color.green("[WWEB]"), color.redBright("Conexão encerrada: "), reason);
  });

  client.initialize();

  return client;
};
