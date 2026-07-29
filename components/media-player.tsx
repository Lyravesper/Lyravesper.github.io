"use client"

import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaPlayer as MediaPlayerData } from "@/lib/detail-content"

const DEFAULT_VOLUME = 40

type YTPlayerInstance = {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setVolume: (volume: number) => void
  getCurrentTime: () => number
  getDuration: () => number
}

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      width?: number
      height?: number
      events: {
        onReady?: (event: { target: YTPlayerInstance }) => void
        onStateChange?: (event: { target: YTPlayerInstance; data: number }) => void
      }
    }
  ) => YTPlayerInstance
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let youtubeApiPromise: Promise<YTNamespace> | null = null

function loadYouTubeApi(): Promise<YTNamespace> {
  if (youtubeApiPromise) return youtubeApiPromise
  youtubeApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }
    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      resolve(window.YT as YTNamespace)
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(script)
    }
  })
  return youtubeApiPromise
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function MediaPlayerCard({ player }: { player: MediaPlayerData }) {
  const videoId = extractYouTubeId(player.youtubeUrl)
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (!videoId || !mountRef.current) return
    let cancelled = false

    loadYouTubeApi().then((YTApi) => {
      if (cancelled || !mountRef.current) return
      playerRef.current = new YTApi.Player(mountRef.current, {
        videoId,
        width: 1,
        height: 1,
        events: {
          onReady: (event) => {
            event.target.setVolume(DEFAULT_VOLUME)
          },
          onStateChange: (event) => {
            const playing = event.data === YTApi.PlayerState.PLAYING
            setIsPlaying(playing)
            if (playing) setDuration(event.target.getDuration())
          },
        },
      })
    })

    return () => {
      cancelled = true
    }
  }, [videoId])

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      const p = playerRef.current
      if (!p) return
      const current = p.getCurrentTime()
      const total = p.getDuration()
      setCurrentTime(current)
      setDuration(total)
      setProgress(total > 0 ? (current / total) * 100 : 0)
    }, 250)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  function togglePlay() {
    const p = playerRef.current
    if (!p) return
    if (isPlaying) {
      p.pauseVideo()
    } else {
      p.playVideo()
    }
  }

  function handleSeek(event: MouseEvent<HTMLDivElement>) {
    const p = playerRef.current
    if (!p || duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    p.seekTo(ratio * duration, true)
    setProgress(ratio * 100)
    setCurrentTime(ratio * duration)
  }

  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value)
    setVolume(next)
    setIsMuted(next === 0)
    playerRef.current?.setVolume(next)
  }

  function toggleMute() {
    const p = playerRef.current
    if (!p) return
    if (isMuted || volume === 0) {
      const restored = volume > 0 ? volume : DEFAULT_VOLUME
      p.setVolume(restored)
      setVolume(restored)
      setIsMuted(false)
    } else {
      p.setVolume(0)
      setIsMuted(true)
    }
  }

  const displayedVolume = isMuted ? 0 : volume

  return (
    <div className="max-w-sm relative rounded-2xl border-2 border-primary/15 bg-card/60 p-4 shadow-sm transition-colors hover:border-primary/30">
      <div
        className={cn(
          "relative w-full aspect-square rounded-xl overflow-hidden bg-muted shadow-lg border-2 transition-colors duration-300",
          isPlaying ? "border-primary shadow-primary/20" : "border-primary/20"
        )}
      >
        <img
          src={player.cover}
          alt={`Pochette : ${player.title}`}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Mettre en pause" : "Lire"}
          className="group absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors"
        >
          {isPlaying && (
            <span className="absolute w-16 h-16 rounded-full bg-primary/25 animate-pulse" />
          )}
          <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-background/90 shadow-lg ring-2 ring-primary/40 group-hover:ring-primary group-hover:scale-105 transition-all">
            {isPlaying ? (
              <Pause className="h-6 w-6 text-foreground" />
            ) : (
              <Play className="h-6 w-6 text-foreground translate-x-0.5" />
            )}
          </span>
        </button>
      </div>

      <div className="mt-3">
        <p className="font-semibold text-foreground">{player.title}</p>
        <p className="text-sm text-muted-foreground">{player.composer}</p>
      </div>

      <div
        className="group/bar relative mt-3 h-2 flex items-center rounded-full bg-muted cursor-pointer"
        onClick={handleSeek}
        role="slider"
        aria-label="Progression de la lecture"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="h-full w-full rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-primary shadow ring-2 ring-background opacity-0 group-hover/bar:opacity-100 transition-opacity"
          style={{ left: `${progress}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={displayedVolume}
          onChange={handleVolumeChange}
          aria-label="Volume"
          className="w-24 accent-primary"
        />
      </div>

      <div className="absolute bottom-0 right-0 w-px h-px overflow-hidden opacity-0 pointer-events-none">
        <div ref={mountRef} />
      </div>
    </div>
  )
}
