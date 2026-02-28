import { getTogetherClient } from './client'
import type { ImageGenerationParams, ImageGenerationResult } from '@/types/together'

export async function generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const together = getTogetherClient()

  const requestParams: Record<string, any> = {
    model: params.model,
    prompt: params.prompt,
    width: params.width || 1024,
    height: params.height || 1024,
    n: params.n || 1,
    response_format: params.responseFormat || 'url',
  }

  if (params.steps) requestParams.steps = params.steps
  if (params.seed) requestParams.seed = params.seed
  if (params.negativePrompt) requestParams.negative_prompt = params.negativePrompt

  const response = await together.images.generate(requestParams as any)

  const data = response as any
  const image = data.data?.[0]
  if (!image?.url) {
    throw new Error('No image generated')
  }

  return {
    url: image.url,
    seed: image.seed,
    width: params.width || 1024,
    height: params.height || 1024,
  }
}

export async function generateImageFromImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
  if (!params.imageUrl) {
    throw new Error('imageUrl is required for image-to-image generation')
  }

  const together = getTogetherClient()

  const requestParams: Record<string, any> = {
    model: params.model,
    prompt: params.prompt,
    image_url: params.imageUrl,
    width: params.width || 1024,
    height: params.height || 1024,
    n: params.n || 1,
    response_format: params.responseFormat || 'url',
  }

  if (params.steps) requestParams.steps = params.steps
  if (params.seed) requestParams.seed = params.seed
  if (params.negativePrompt) requestParams.negative_prompt = params.negativePrompt

  const response = await together.images.generate(requestParams as any)

  const data = response as any
  const image = data.data?.[0]
  if (!image?.url) {
    throw new Error('No image generated')
  }

  return {
    url: image.url,
    seed: image.seed,
    width: params.width || 1024,
    height: params.height || 1024,
  }
}
