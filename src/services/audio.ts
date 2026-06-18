// 音频服务 - 封装 HTML5 Audio

let audioInstance: HTMLAudioElement | null = null;
let listeners: Set<() => void> = new Set();

function getAudio(): HTMLAudioElement {
  if (!audioInstance) {
    audioInstance = new Audio();
    audioInstance.addEventListener("timeupdate", () => notifyListeners());
    audioInstance.addEventListener("play", () => notifyListeners());
    audioInstance.addEventListener("pause", () => notifyListeners());
    audioInstance.addEventListener("ended", () => notifyListeners());
    audioInstance.addEventListener("loadedmetadata", () => notifyListeners());
  }
  return audioInstance;
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadAudio(url: string): void {
  const audio = getAudio();
  audio.src = url;
  audio.load();
}

export function play(): void {
  getAudio().play();
}

export function pause(): void {
  getAudio().pause();
}

export function togglePlay(): void {
  const audio = getAudio();
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

export function seek(time: number): void {
  getAudio().currentTime = time;
}

export function setPlaybackRate(rate: number): void {
  getAudio().playbackRate = rate;
}

export function getCurrentTime(): number {
  return getAudio().currentTime;
}

export function getDuration(): number {
  return getAudio().duration || 0;
}

export function isPaused(): boolean {
  return getAudio().paused;
}

export function setVolume(volume: number): void {
  getAudio().volume = volume;
}

// A-B 复读
let abRepeat: { a: number; b: number } | null = null;

export function setABRepeat(a: number, b: number): void {
  abRepeat = { a, b };
  getAudio().addEventListener("timeupdate", checkABRepeat);
}

export function clearABRepeat(): void {
  abRepeat = null;
  getAudio().removeEventListener("timeupdate", checkABRepeat);
}

function checkABRepeat() {
  if (!abRepeat || !audioInstance) return;
  if (audioInstance.currentTime >= abRepeat.b) {
    audioInstance.currentTime = abRepeat.a;
  }
}

// 音频文件上传 - 转为 Blob URL
export function fileToBlobUrl(file: File): string {
  return URL.createObjectURL(file);
}
