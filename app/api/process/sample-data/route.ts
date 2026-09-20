import { NextResponse } from 'next/server';
import { getTrackColor } from '@/lib/color-utils';

export async function GET() {
  const width = 2160;
  const height = 3840;
  const fps = 30;
  const totalFrames = 300; // 10 seconds sample sequence at 30 fps

  // Pedestrians trajectory definitions for the 4K scene
  const persons = [
    { id: 1, startX: 0.15, startY: 0.65, vx: 0.0006, vy: -0.0002, w: 0.045, h: 0.09, name: 'Pessoa #1' },
    { id: 2, startX: 0.28, startY: 0.72, vx: -0.0004, vy: -0.0003, w: 0.038, h: 0.08, name: 'Pessoa #2' },
    { id: 3, startX: 0.52, startY: 0.58, vx: 0.0005, vy: 0.0001, w: 0.042, h: 0.085, name: 'Pessoa #3' },
    { id: 4, startX: 0.68, startY: 0.80, vx: -0.0008, vy: -0.0004, w: 0.052, h: 0.11, name: 'Pessoa #4' },
    { id: 5, startX: 0.82, startY: 0.45, vx: -0.0003, vy: 0.0003, w: 0.032, h: 0.065, name: 'Pessoa #5 (Distante)' },
    { id: 6, startX: 0.44, startY: 0.35, vx: 0.0002, vy: 0.0001, w: 0.024, h: 0.05, name: 'Pessoa #6 (Fundo 4K)' },
    // Critical case mentioned in prompt: Pessoa 7 gets temporarily occluded by a pole/vehicle from frame 80 to 140
    // Tracker marks it as LOST, then ReID matches it back upon reappearance!
    { id: 7, startX: 0.35, startY: 0.62, vx: 0.0007, vy: 0.0001, w: 0.046, h: 0.095, name: 'Pessoa #7 (Oclusão & ReID)' },
    { id: 8, startX: 0.60, startY: 0.38, vx: -0.0003, vy: 0.0002, w: 0.026, h: 0.055, name: 'Pessoa #8' },
    { id: 9, startX: 0.75, startY: 0.60, vx: -0.0005, vy: 0.0002, w: 0.040, h: 0.082, name: 'Pessoa #9' },
    { id: 10, startX: 0.20, startY: 0.48, vx: 0.0004, vy: 0.0003, w: 0.030, h: 0.062, name: 'Pessoa #10' },
  ];

  const frames = [];

  for (let f = 0; f < totalFrames; f++) {
    const timestamp = f / fps;
    const detections = [];

    for (const p of persons) {
      // Simulate occlusion for Person #7 between frames 85 and 130 (behind pole)
      if (p.id === 7 && f >= 85 && f <= 130) {
        // Frame 85-95: LOST state (no visual mask rendered, strictly adhering to rule: never draw mask when no visual evidence)
        continue;
      }

      const curX = p.startX + p.vx * f;
      const curY = p.startY + p.vy * f;

      // Determine state
      let state = 'ACTIVE';
      if (p.id === 7 && f > 130 && f < 145) {
        state = 'RECOVERED'; // Recovered via ReID appearance embedding
      }

      // Generate realistic person segmentation polygon (head, shoulders, torso, legs)
      // Coordinates normalized [0..1]
      const halfW = p.w / 2;
      const mask = [
        [curX, curY - p.h * 0.48], // Top head
        [curX + halfW * 0.4, curY - p.h * 0.42], // Head right
        [curX + halfW * 0.85, curY - p.h * 0.28], // Right shoulder
        [curX + halfW * 0.95, curY - p.h * 0.05], // Right elbow/arm
        [curX + halfW * 0.75, curY + p.h * 0.15], // Right hip
        [curX + halfW * 0.65, curY + p.h * 0.48], // Right foot
        [curX + halfW * 0.1, curY + p.h * 0.48], // Between feet
        [curX, curY + p.h * 0.2], // Crotch
        [curX - halfW * 0.1, curY + p.h * 0.48],
        [curX - halfW * 0.65, curY + p.h * 0.48], // Left foot
        [curX - halfW * 0.75, curY + p.h * 0.15], // Left hip
        [curX - halfW * 0.95, curY - p.h * 0.05], // Left elbow
        [curX - halfW * 0.85, curY - p.h * 0.28], // Left shoulder
        [curX - halfW * 0.4, curY - p.h * 0.42], // Head left
      ];

      detections.push({
        track_id: p.id,
        confidence: Number((0.88 + Math.sin(f * 0.05 + p.id) * 0.09).toFixed(3)),
        bounding_box: {
          x: curX - halfW,
          y: curY - p.h / 2,
          width: p.w,
          height: p.h,
        },
        segmentation_mask: mask,
        state: state,
        color: getTrackColor(p.id),
      });
    }

    frames.push({
      frame_index: f,
      timestamp: Number(timestamp.toFixed(3)),
      detections,
      active_count: detections.length,
      lost_count: (f >= 85 && f <= 130) ? 1 : 0,
    });
  }

  const tracksSummary = persons.map((p) => ({
    track_id: p.id,
    first_frame: 0,
    last_frame: totalFrames - 1,
    total_frames: p.id === 7 ? totalFrames - 46 : totalFrames,
    confidence_avg: 0.94,
    color: getTrackColor(p.id),
    state: p.id === 7 ? 'RECOVERED' : 'ACTIVE',
    reconciled: p.id === 7,
  }));

  return NextResponse.json({
    version: '1.0.0',
    metadata: {
      name: 'video_4k_trafego_pedestres.mp4',
      width,
      height,
      fps,
      total_frames: totalFrames,
      duration_seconds: 10.0,
      preset: 'maxima_precisao',
    },
    summary: {
      total_persons_detected: 10,
      reconciled_tracks: 1,
      lost_recoveries: 1,
      average_confidence: 0.938,
    },
    tracks_summary: tracksSummary,
    frames,
  });
}
