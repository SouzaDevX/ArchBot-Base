const { Client, LocalAuth } = require("whatsapp-web.js");
const qr = require("qrcode-terminal");
const { ASSETS_DIR } = require("./config");

exports.connect = async () => {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "nexus",
      dataPath: `${ASSETS_DIR}/auth/wwebjs/`,
    }),
    puppeteer: {
      product: "chrome",
      ignoreDefaultArgs: ["--enable-automation"],
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu-driver-bug-workarounds",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process", // <- this one doesn't work in Windows
        "--disable-gpu",
        "--disable-web-security",
        "--hide-scrollbars",
        "--disable-cache",
        "--disable-application-cache",
      ],
    },
    restartOnAuthFail: true,
  });

  client.on("qr", async (data) => {
    await qr.generate(data, {
      small: true,
    });
  });

  client.on("ready", async () => {
    client.sendPresenceAvailable();
    console.log("\x1b[32m[WWEB]\x1b[0m Nexus Bot Online!");
  });

  client.on("loading_screen", async (status) => {
    console.log("\x1b[32m[WWEB]\x1b[0m Carregando Página: ", status + "%");
  });

  client.on("change_state", (status) => {
    console.log("\x1b[32m[WWEB]\x1b[0m Sessão modificada: ", status);
  });

  client.on("auth_failure", (reason) => {
    console.log("\x1b[32m[WWEB]\x1b[0m Falha na autenticação: ", reason);
  });

  client.initialize();

  return client;
};
