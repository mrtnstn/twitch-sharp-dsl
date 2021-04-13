/*
 * Useful functions that are used by both the projection(s), as well as the code generation.
 */

export const indefiniteArticleFor = (nextWord: string) => "a" + ((typeof nextWord === "string" && nextWord.match(/^[aeiouAEIOU]/)) ? "n" : "")
export const withFirstUpper = (str: string) => str.charAt(0).toUpperCase() + str.substring(1)

