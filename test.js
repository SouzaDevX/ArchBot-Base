const natural = require('natural');

function findMostSimilarCommand(inputCommand, validCommands) {
  const mostSimilarCommands = [];

  validCommands.forEach(command => {
    const distance = natural.LevenshteinDistance(inputCommand, command);
    const similarity = (1 - distance / Math.max(inputCommand.length, command.length)) * 100;

    if (similarity >= 60) {
      mostSimilarCommands.push({ name: command, similarity: similarity.toFixed(2) });
    }
  });

  return mostSimilarCommands;
}

// Exemplo de uso
const text1 = "kuai";
const text2 = ["kwai", "kwaai", "kwai1", 'kauana', 'bunda'];
const similarity = findMostSimilarCommand(text1, text2);
console.log(similarity);
