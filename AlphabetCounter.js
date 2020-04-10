class AlphabetCounter {
  #alphabet = null;

  #alphabetFirst = null;

  #alphabetLast = null;

  #value = null;

  constructor(alphabet = 'abcdefghijklmnopqrstuvwxyz') {
    this.#alphabet = alphabet;
    this.#alphabetFirst = alphabet[0];
    this.#alphabetLast = alphabet[alphabet.length - 1];
    this.#value = [this.#alphabetFirst];
  }

  getNextValue() {
    return this.#value.reduceRight((agg, e) => {
      if (e === this.#alphabetLast && !agg.doneTr) {
          agg.output.push(this.#alphabetFirst);
      } else {
          agg.doneTr = true; // eslint-disable-line no-param-reassign

          if (!agg.doneUp) {
              agg.output.push(this.#alphabet[this.#alphabet.indexOf(e) + 1]);
              agg.doneUp = true; // eslint-disable-line no-param-reassign
          } else agg.output.push(e);
      }
      return agg;
    }, { doneTr: false, doneUp: false, output: [] })
      .output
      .reverse();
  }

  next() {
    const isDoneOrder = this.#value.every(e => e === this.#alphabetLast);
    this.#value = this.getNextValue();
    if (isDoneOrder) this.#value.push(this.#alphabetFirst);
    return this.#value.join('');
  }

  *generator() {
    while (true) yield this.next();
  }
}

// const idGenerator = (new AlphabetCounter()).generator();
// Array.from({ length: 1000 }, (_e, i) => i).forEach(() => console.log(idGenerator.next().value));
