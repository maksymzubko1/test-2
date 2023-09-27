export function capitalize(word: string) {
  const letters = word.toLowerCase().replaceAll("_", " ").split("");
  letters[0] = letters.at(0)?.toUpperCase();
  return letters.join("");
}
