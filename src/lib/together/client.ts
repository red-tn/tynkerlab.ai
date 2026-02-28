import Together from 'together-ai'

let togetherInstance: Together | null = null

export function getTogetherClient(): Together {
  if (!togetherInstance) {
    togetherInstance = new Together({
      apiKey: process.env.TOGETHER_API_KEY,
    })
  }
  return togetherInstance
}
