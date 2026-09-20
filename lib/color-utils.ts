// High-contrast, distinguishable palette for multi-person tracking
const PALETTE = [
  '#00E5FF', // Cyan electric
  '#FF3D71', // Vivid Rose
  '#00E676', // Bright emerald
  '#FFAB00', // Amber orange
  '#7C4DFF', // Deep violet
  '#FF6D00', // Blaze orange
  '#00B0FF', // Sky blue
  '#F50057', // Pink neon
  '#1DE9B6', // Teal mint
  '#FFD600', // Lemon yellow
  '#651FFF', // Indigo bright
  '#AEEA00', // Lime electric
  '#304FFE', // Royal blue
  '#D500F9', // Magenta
  '#00BFA5', // Aqua
  '#FF5252', // Coral red
];

/**
 * Returns a consistent hex color for a given track_id
 */
export function getTrackColor(trackId: number): string {
  if (trackId <= 0) return '#9E9E9E';
  const index = (Math.abs(trackId) - 1) % PALETTE.length;
  return PALETTE[index];
}

/**
 * Converts hex color to rgba string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Default preset configurations
 */
import { PipelineConfig, PresetMode } from '@/types/tracking';

export const PRESET_CONFIGS: Record<PresetMode, PipelineConfig> = {
  maxima_precisao: {
    preset: 'maxima_precisao',
    onlyPersonClass: true,
    tiledInference: true,
    tileSize: 1280,
    tileOverlap: 0.25,
    segmentationModel: 'sam2',
    tracker: 'BoT-SORT',
    useReID: true,
    reidEmbeddingModel: 'osnet_x1_0',
    maxLostFrames: 90, // ~3 seconds at 30fps
    iouThreshold: 0.35,
    appearanceWeight: 0.65,
    globalReconciliation: true,
    temporalSmoothing: true,
    preserveOriginalAudio: true,
    outputCodec: 'h264',
  },
  equilibrado: {
    preset: 'equilibrado',
    onlyPersonClass: true,
    tiledInference: false,
    tileSize: 1280,
    tileOverlap: 0.15,
    segmentationModel: 'sam2_lite',
    tracker: 'BoT-SORT',
    useReID: true,
    reidEmbeddingModel: 'osnet_x1_0',
    maxLostFrames: 60,
    iouThreshold: 0.4,
    appearanceWeight: 0.5,
    globalReconciliation: false,
    temporalSmoothing: true,
    preserveOriginalAudio: true,
    outputCodec: 'h264',
  },
  rapido: {
    preset: 'rapido',
    onlyPersonClass: true,
    tiledInference: false,
    tileSize: 960,
    tileOverlap: 0.1,
    segmentationModel: 'yolo_seg_only',
    tracker: 'ByteTrack',
    useReID: false,
    reidEmbeddingModel: 'none',
    maxLostFrames: 30,
    iouThreshold: 0.45,
    appearanceWeight: 0.2,
    globalReconciliation: false,
    temporalSmoothing: false,
    preserveOriginalAudio: true,
    outputCodec: 'h264',
  },
};
