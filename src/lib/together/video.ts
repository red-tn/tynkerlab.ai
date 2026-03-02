import { getTogetherClient } from './client'
import type { VideoGenerationParams, VideoJobResult, VideoStatusResult } from '@/types/together'

export async function createVideoJob(params: VideoGenerationParams): Promise<VideoJobResult> {
  const together = getTogetherClient()

  const requestParams: Record<string, any> = {
    model: params.model,
    prompt: params.prompt,
  }

  // Only send params that the Together.ai video API actually supports
  // See SDK: VideoCreateParams in together-ai/resources/videos.d.ts
  if (params.width) requestParams.width = params.width
  if (params.height) requestParams.height = params.height
  // Note: aspect_ratio is NOT a valid video API param — use width/height instead
  if (params.seed != null) requestParams.seed = params.seed
  if (params.seconds) requestParams.seconds = String(params.seconds)
  if (params.steps) requestParams.steps = params.steps
  if (params.guidanceScale) requestParams.guidance_scale = params.guidanceScale
  if (params.negativePrompt) requestParams.negative_prompt = params.negativePrompt
  // camera_movement is supported by some models (e.g. PixVerse) even though
  // it's not in the SDK types — the API accepts it
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
  const job = await together.videos.retrieve(jobId)

  // SDK returns typed VideoJob: { status, outputs?: { cost, video_url }, error?: { message, code } }
  const videoUrl = job.outputs?.video_url
  const errorMsg = job.error?.message

  return {
    id: jobId,
    status: job.status as VideoStatusResult['status'],
    videoUrl: videoUrl || undefined,
    error: errorMsg || undefined,
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
