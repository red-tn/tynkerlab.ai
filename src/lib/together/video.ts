import { getTogetherClient } from './client'
import type { VideoGenerationParams, VideoJobResult, VideoStatusResult } from '@/types/together'

export async function createVideoJob(params: VideoGenerationParams): Promise<VideoJobResult> {
  const together = getTogetherClient()

  const requestParams: Record<string, any> = {
    model: params.model,
    prompt: params.prompt,
  }

  if (params.width) requestParams.width = params.width
  if (params.height) requestParams.height = params.height
  if (params.aspectRatio) requestParams.aspect_ratio = params.aspectRatio
  if (params.seed != null) requestParams.seed = params.seed
  if (params.seconds) requestParams.seconds = String(params.seconds)
  if (params.steps) requestParams.steps = params.steps
  if (params.guidanceScale) requestParams.guidance_scale = params.guidanceScale
  if (params.negativePrompt) requestParams.negative_prompt = params.negativePrompt
  if (params.cameraMotion) requestParams.camera_movement = params.cameraMotion

  if (params.frameImages && params.frameImages.length > 0) {
    requestParams.frame_images = params.frameImages.map(url => ({
      input_image: url,
    }))
  }

  const job = await together.videos.create(requestParams as any)

  return {
    id: (job as any).id,
    status: 'pending',
  }
}

export async function checkVideoStatus(jobId: string): Promise<VideoStatusResult> {
  const together = getTogetherClient()
  const status = await together.videos.retrieve(jobId) as any

  // Together.ai returns "outputs" (plural) in their API, but SDK may use "output"
  const outputData = status.outputs || status.output

  return {
    id: jobId,
    status: status.status as VideoStatusResult['status'],
    output: outputData?.video_url ? { video_url: outputData.video_url } : undefined,
    error: status.error || undefined,
  }
}

export async function pollVideoUntilComplete(
  jobId: string,
  intervalMs: number = 5000,
  timeoutMs: number = 300000 // 5 minutes
): Promise<VideoStatusResult> {
  const startTime = Date.now()

  while (true) {
    const status = await checkVideoStatus(jobId)

    if (status.status === 'completed' || status.status === 'failed') {
      return status
    }

    if (Date.now() - startTime > timeoutMs) {
      return {
        id: jobId,
        status: 'failed',
        error: 'Video generation timed out after 5 minutes',
      }
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
}
