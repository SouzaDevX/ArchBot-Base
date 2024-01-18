class GlobalError extends Error {
  constructor(message, emoji = "😿") {
    super(message);
    this.react = emoji;
    this.name = "NoneError";
  }
}

module.exports = {
  GlobalError,
};
