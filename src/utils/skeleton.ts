const generateItems = (n: number) => [...Array(n)].map((_, i) => ({ id: i.toString() }))

export const skeleton = {
  generateItems,
}
