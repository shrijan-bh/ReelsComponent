"use client";

import {
  Heart,
  MessageCircle,
  Send,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const reels = [
  {
    id: 1,
    background: "https://i.imgur.com/jg6HwrR.gif",
    username: "aisyahnrln",
    caption: "Trees, fogs, and mountains 🌲🌫️",
    likes: "1.3K",
  },
  {
    id: 2,
    background: "https://i.imgur.com/Wr0K3RI.mp4",
    username: "forest.walks",
    caption: "Nature heals 🍃🌿",
    likes: "964",
  },
  {
    id: 3,
    background: "https://i.imgur.com/ik1KYPE.mp4",
    username: "animal",
    caption: "Chasing ",
    likes: "2.1K",
  },
  {
    id: 4,
    background: "https://i.imgur.com/XTOB93W.mp4",
    username: "urbanvibes",
    caption: "Japan mountains",
    likes: "786",
  },
  {
    id: 5,
    background: "https://i.imgur.com/4A3UV8Z.mp4",
    username: "pizza",
    caption: "City lights & Pizza 🌃🍸",
    likes: "786",
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const [activeReel, setActiveReel] = useState<number>(reels[0].id);
  const [pausedVideos, setPausedVideos] = useState<Record<number, boolean>>({});
  const [mutedVideos, setMutedVideos] = useState<Record<number, boolean>>({});
  const [progresses, setProgresses] = useState<Record<number, number>>({}); // percent 0-100

  // Detect currently visible reel on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;

      const scrollTop = containerRef.current.scrollTop;
      const viewportHeight = window.innerHeight;

      // Determine which reel is mostly visible (simple approach)
      let newActive = activeReel;
      for (const reel of reels) {
        const elem = document.getElementById(`reel-${reel.id}`);
        if (!elem) continue;

        const offsetTop = elem.offsetTop;
        if (
          scrollTop + viewportHeight / 2 >= offsetTop &&
          scrollTop + viewportHeight / 2 < offsetTop + viewportHeight
        ) {
          newActive = reel.id;
          break;
        }
      }

      if (newActive !== activeReel) {
        setActiveReel(newActive);
      }
    };

    const current = containerRef.current;
    current?.addEventListener("scroll", onScroll, { passive: true });

    return () => current?.removeEventListener("scroll", onScroll);
  }, [activeReel]);

  // When active reel changes, pause all others, play active one if not paused manually
  useEffect(() => {
    reels.forEach((reel) => {
      const videoEl = videoRefs.current[reel.id];
      if (!videoEl) return;

      if (reel.id === activeReel) {
        if (!pausedVideos[reel.id]) {
          videoEl.play();
        }
        videoEl.muted = mutedVideos[reel.id] ?? false;
      } else {
        videoEl.pause();
        videoEl.muted = true;
      }
    });
  }, [activeReel, pausedVideos, mutedVideos]);

  // Update progress every 250ms for active reel
  useEffect(() => {
    if (!videoRefs.current[activeReel]) return;

    const video = videoRefs.current[activeReel];
    if (!video) return;

    const updateProgress = () => {
      if (!video.duration) return;
      const percent = (video.currentTime / video.duration) * 100;
      setProgresses((prev) => ({ ...prev, [activeReel]: percent }));
    };

    video.addEventListener("timeupdate", updateProgress);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, [activeReel]);

  // Toggle play/pause on click only for active reel
  const toggleVideo = (id: number) => {
    const videoEl = videoRefs.current[id];
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setPausedVideos((prev) => ({ ...prev, [id]: false }));
    } else {
      videoEl.pause();
      setPausedVideos((prev) => ({ ...prev, [id]: true }));
    }
  };

  // Toggle mute/unmute for active reel
  const toggleMute = (id: number) => {
    const videoEl = videoRefs.current[id];
    if (!videoEl) return;

    const mutedNow = mutedVideos[id] ?? false;
    videoEl.muted = !mutedNow;
    setMutedVideos((prev) => ({ ...prev, [id]: !mutedNow }));
  };

  // Seek video on progress bar change
  const onSeek = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const videoEl = videoRefs.current[id];
    if (!videoEl || !videoEl.duration) return;

    const seekTo = (parseFloat(e.target.value) / 100) * videoEl.duration;
    videoEl.currentTime = seekTo;

    // Update progress immediately
    setProgresses((prev) => ({ ...prev, [id]: parseFloat(e.target.value) }));
  };

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black no-scrollbar"
    >
      {reels.map((reel) => {
        const isVideo = reel.background.endsWith(".mp4");
        const isActive = activeReel === reel.id;
        const isPaused = pausedVideos[reel.id];
        const isMuted = mutedVideos[reel.id] ?? true; // default muted true on inactive videos
        const progress = progresses[reel.id] ?? 0;

        return (
          <section
            id={`reel-${reel.id}`}
            key={reel.id}
            className="snap-start h-screen w-full flex items-center justify-center bg-black"
          >
            {/* Reel in 9:16 aspect ratio */}
            <div
              className="relative aspect-[9/16] w-full max-w-[calc(100vh*(9/16))] overflow-hidden bg-black cursor-pointer"
              onClick={() => isActive && toggleVideo(reel.id)}
            >
              {isVideo ? (
                <>
                  <video
                    ref={(el) => {
                      videoRefs.current[reel.id] = el;
                    }}
                    src={reel.background}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    autoPlay={isActive && !isPaused}
                    loop
                    muted={isMuted || !isActive}
                    playsInline
                  />
                  {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <Play className="w-16 h-16 text-white opacity-90 drop-shadow-[0_0_8px_rgb(255,255,255)]" />
                    </div>
                  )}
                </>
              ) : (
                <Image
                  src={reel.background}
                  alt={reel.caption}
                  fill
                  className="object-contain bg-black"
                  priority
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 z-10" />

              {/* Header */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white font-semibold text-sm"></div>

              {/* Mute/unmute icon top right */}
              {isVideo && (
                <button
                  className="absolute top-4 right-5 z-20 text-white w-6 h-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute(reel.id);
                  }}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  title={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <VolumeX /> : <Volume2 />}
                </button>
              )}

              {/* Footer Info */}
              <div className="absolute bottom-6 left-4 z-20 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white rounded-full" />
                  <span className="font-bold">@{reel.username}</span>
                  <button className="ml-2 px-3 py-1 border border-white text-white text-xs rounded-full hover:bg-white hover:text-black transition-all">
                    Follow
                  </button>
                </div>
                <p className="mt-2 text-sm">{reel.caption}</p>
              </div>

              {/* Right Action Buttons */}
              <div className="absolute bottom-10 right-4 z-20 flex flex-col items-center gap-4 text-white text-sm">
                <div className="group">
                  <Heart className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  <span className="text-xs">{reel.likes}</span>
                </div>
                <MessageCircle className="w-6 h-6 hover:scale-125 transition-transform" />
                <Send className="w-6 h-6 hover:scale-125 transition-transform" />
              </div>

              {/* Progress Bar at bottom */}
              {isVideo && (
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={progress}
                  onChange={(e) => onSeek(reel.id, e)}
                  className="absolute top-242 left-4 right-4 w-[calc(100%-4rem)] progress-range"
                  style={
                    { "--progress": `${progress}%` } as React.CSSProperties
                  }
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Seek video progress"
                />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
