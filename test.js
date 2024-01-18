const livro = {
  titulo: "JavaScript: The Good Parts",
  autor: "Douglas Crockford",
  toString: function () {
    return `${this.titulo} por ${this.autor}`;
  },
};

console.log(livro.toString()); // Chama automaticamente o método toString
