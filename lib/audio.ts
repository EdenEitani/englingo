class AudioManager {
  private audioCache: Map<string, string> = new Map() // text → blob URL
  private currentAudio: HTMLAudioElement | null = null
  private _isPlaying: boolean = false
  playbackRate: number = 1.0

  get isPlaying(): boolean {
    return this._isPlaying
  }

  async playText(
    text: string,
    type: 'sentence' | 'word' = 'sentence',
    onEnd?: () => void
  ): Promise<void> {
    this.stop()

    const cacheKey = `${type}:${text}`
    let blobUrl = this.audioCache.get(cacheKey)

    if (!blobUrl) {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type }),
      })

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`)
      }

      const blob = await response.blob()
      blobUrl = URL.createObjectURL(blob)
      this.audioCache.set(cacheKey, blobUrl)
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(blobUrl)
      audio.playbackRate = this.playbackRate
      this.currentAudio = audio
      this._isPlaying = true

      audio.onended = () => {
        this._isPlaying = false
        this.currentAudio = null
        onEnd?.()
        resolve()
      }

      audio.onerror = () => {
        this._isPlaying = false
        this.currentAudio = null
        reject(new Error('Audio playback error'))
      }

      audio.play().catch((err) => {
        this._isPlaying = false
        this.currentAudio = null
        reject(err)
      })
    })
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
    this._isPlaying = false
  }

  clearCache(): void {
    this.audioCache.forEach((url) => URL.revokeObjectURL(url))
    this.audioCache.clear()
  }
}

// Singleton instance — shared across the app
export const audioManager = new AudioManager()
