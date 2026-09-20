export type PresetMode = 'rapido' | 'equilibrado' | 'maxima_precisao';

export type TrackerType = 'TrackTrack' | 'BoT-SORT' | 'Deep-OC-SORT' | 'ByteTrack';

export type TrackState = 'ACTIVE' | 'LOST' | 'RECOVERED' | 'RECONCILED';

export type OverlayMode = 'mask_id' | 'contour_id' | 'bbox_id' | 'mask_only' | 'mask';

export interface VideoMetadata {
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  durationSeconds: number;
  durationFormatted: string;
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
  mimeType: string;
  aspectRatio: string;
  is4KOrHigher: boolean;
}

export interface PipelineConfig {
  preset: PresetMode;
  onlyPersonClass: boolean; // strictly class 'person'
  tiledInference: boolean; // Overlapping tiles for small distant persons in 4K
  tileSize: number; // e.g. 1280
  tileOverlap: number; // e.g. 0.25 (25%)
  segmentationModel: 'sam2' | 'yolo_seg_only' | 'sam2_lite';
  tracker: TrackerType;
  useReID: boolean;
  reidEmbeddingModel: string; // 'osnet_x1_0' or 'resnet50'
  maxLostFrames: number; // buffer frames in LOST state before dropping
  iouThreshold: number;
  appearanceWeight: number; // 0.0 - 1.0 weight for ReID vs spatial
  globalReconciliation: boolean; // offline 2nd pass to fix ID switches
  temporalSmoothing: boolean; // prevent mask jittering
  preserveOriginalAudio: boolean;
  outputCodec: 'h264' | 'h265';
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PersonDetection {
  track_id: number;
  confidence: number;
  bounding_box: BoundingBox; // normalized 0..1 or absolute
  segmentation_mask?: number[][]; // polygon points [[x, y], ...]
  state: TrackState;
  reid_distance?: number;
  color?: string;
}

export interface FrameTrackingData {
  frame_index: number;
  timestamp: number;
  detections: PersonDetection[];
  active_count: number;
  lost_count: number;
}

export interface TrackSummary {
  track_id: number;
  first_frame: number;
  last_frame: number;
  total_frames: number;
  confidence_avg: number;
  color: string;
  state: TrackState;
  recovered_from_id?: number;
  reconciled: boolean;
}

export interface VideoProcessingJob {
  jobId: string;
  status: 'idle' | 'uploading' | 'queued' | 'processing' | 'reconciling' | 'completed' | 'failed';
  config: PipelineConfig;
  metadata?: VideoMetadata;
  progressPercent: number;
  currentFrame: number;
  totalFrames: number;
  detectedPersonsCount: number;
  activeTracksCount: number;
  lostTracksCount: number;
  processingFps: number;
  estimatedRemainingSeconds: number;
  currentStage: string;
  logs: string[];
  trackingData?: FrameTrackingData[];
  tracksSummary?: TrackSummary[];
  outputVideoUrl?: string;
  outputJsonUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface IdCorrectionRequest {
  jobId: string;
  sourceTrackId: number;
  targetTrackId: number;
  fromFrame?: number;
  toFrame?: number;
  mode: 'merge' | 'reassign';
}

export interface BackendStatus {
  configured: boolean;
  url?: string;
  reachable: boolean;
  gpuAvailable?: boolean;
  gpuName?: string;
  modelsLoaded?: {
    yolo: boolean;
    sam2: boolean;
    reid: boolean;
    ffmpeg: boolean;
  };
  latencyMs?: number;
  version?: string;
  message?: string;
}
