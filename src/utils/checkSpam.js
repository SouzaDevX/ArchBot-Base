const { extractDataFromMessage } = require(".");

const messageCounts = {};
const blockedUsers = {};

const isUserBlocked = (user) => {
  const isBlock = blockedUsers[user] && blockedUsers[user] > Date.now();
  if (!isBlock) {
    delete blockedUsers[user];
  }
  return isBlock;
};

const blockUser = (user) => {
  blockedUsers[user] = Date.now() + 5000; // Bloquear por 5 segundos
};

exports.checkSpam = async (msg) => {
  const data = await extractDataFromMessage({ msg });
  const { sender: user } = data;

  if (isUserBlocked(user)) {
    return true;
  }

  const currentTime = Date.now();
  if (
    !messageCounts[user] ||
    currentTime - messageCounts[user].timestamp > 3000
  ) {
    messageCounts[user] = {
      count: 1,
      timestamp: currentTime,
    };
  } else {
    messageCounts[user].count++;
  }

  if (messageCounts[user].count > 5) {
    blockUser(user);
    return true;
  }

  return false;
};

const usedCommandRecently = new Set();

exports.isFiltered = (sender) => !!usedCommandRecently.has(sender);

exports.addFilter = (sender) => {
  usedCommandRecently.add(sender);
  setTimeout(() => usedCommandRecently.delete(sender), 5000);
};

const spamWarning = new Set();

exports.isSpamWarning = (sender) => !!spamWarning.has(sender);

exports.addSpamWarning = (sender) => {
  spamWarning.add(sender);
  setTimeout(() => spamWarning.delete(sender), 3500);
};
