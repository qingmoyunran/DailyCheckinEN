// 语音服务 - Web Speech API

// 文字转语音（TTS）
export function speak(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
    onEnd?: () => void;
  } = {}
): void {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;
  utterance.lang = "en-US";

  if (options.voice) {
    utterance.voice = options.voice;
  } else {
    // 优先选择英文女声
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang === "en-US" && v.name.includes("Female")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
}

// 语音识别（STT）
type SpeechRecognitionType = typeof window & {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
};

export function isSpeechRecognitionSupported(): boolean {
  const w = window as SpeechRecognitionType;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function createRecognition(
  onResult: (transcript: string) => void,
  onError?: (error: string) => void,
  onEnd?: () => void
): { start: () => void; stop: () => void } | null {
  const w = window as SpeechRecognitionType;
  const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!SpeechRecognitionClass) return null;

  const recognition = new SpeechRecognitionClass();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}

// 计算文本相似度（基于编辑距离）
export function calculateSimilarity(text1: string, text2: string): number {
  const s1 = text1.toLowerCase().trim().replace(/[^\w\s]/g, "");
  const s2 = text2.toLowerCase().trim().replace(/[^\w\s]/g, "");

  if (s1.length === 0 && s2.length === 0) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  // 使用词级别的编辑距离
  const matrix: number[][] = [];
  for (let i = 0; i <= words1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= words2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= words1.length; i++) {
    for (let j = 1; j <= words2.length; j++) {
      const cost = words1[i - 1] === words2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(words1.length, words2.length);
  const distance = matrix[words1.length][words2.length];
  const similarity = ((maxLen - distance) / maxLen) * 100;
  return Math.round(similarity);
}

// 获取评分反馈
export function getScoreFeedback(score: number): {
  label: string;
  color: string;
  message: string;
} {
  if (score >= 90) {
    return {
      label: "优秀",
      color: "text-easy",
      message: "发音非常标准，继续保持！",
    };
  } else if (score >= 75) {
    return {
      label: "良好",
      color: "text-amber-600",
      message: "发音不错，注意个别单词的发音。",
    };
  } else if (score >= 60) {
    return {
      label: "及格",
      color: "text-medium",
      message: "基本能听懂，多练习提升发音清晰度。",
    };
  } else {
    return {
      label: "需努力",
      color: "text-hard",
      message: "建议多听原文，跟读练习发音。",
    };
  }
}
