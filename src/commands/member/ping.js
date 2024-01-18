const { formatTime } = require("../../utils");
const os = require("os");

function getBotInfo(msg) {
  const timestamp = Date.now() / 1000 - msg.timestamp;
  const uptime = formatTime(process.uptime());
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const cpus = os.cpus().map((cpu, index) => ({
    model: cpu.model,
    usage: {
      user: cpu.times.user,
      system: cpu.times.sys,
      idle: cpu.times.idle,
    },
  }));

  const cpuInfo = cpus
    .map(
      (cpu, index) => `*• CPU ${index + 1}.*
  *• Modelo:* ${cpu.model}
  *• Uso:*
  - Usuário: ${(
    (cpu.usage.user / (cpu.usage.user + cpu.usage.system + cpu.usage.idle)) *
    100
  ).toFixed(2)}%
  - Sistema: ${(
    (cpu.usage.system / (cpu.usage.user + cpu.usage.system + cpu.usage.idle)) *
    100
  ).toFixed(2)}%
  - Inativo: ${(
    (cpu.usage.idle / (cpu.usage.user + cpu.usage.system + cpu.usage.idle)) *
    100
  ).toFixed(2)}%
`
    )
    .join("\n");

  return `≡ *Informações do Bot:*
  *• Velocidade:* ${timestamp.toFixed(3)}ms
  *• Runtime:* ${uptime}
*—*
*≡ Uso de Memória RAM:*
  *• Em uso no Bot:* ${formatBytes(memoryUsage.heapUsed)}
  *• Em uso no Servidor:* ${formatBytes(usedMemory)}
  *• Livre no Servidor:* ${formatBytes(freeMemory)}
  *• Total do Servidor:* ${formatBytes(totalMemory)}
*—*
*≡ Informações do CPU:*
${cpuInfo}
  `;
}

module.exports = {
  commands: ["ping"],
  description: "Informações atuais sobre o bot.",
  handle: async ({ bot, msg }) => {
    const botInfo = getBotInfo(msg);
    await bot.send({
      text: botInfo,
      react: "🏓",
    });
  },
};

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
