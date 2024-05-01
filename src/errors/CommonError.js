class CommonError extends Error {
  constructor(message, emoji = "😿") {
    super(message);
    this.react = emoji;
    this.name = "CommonError";
  }
}

module.exports = {
  CommonError,
};
