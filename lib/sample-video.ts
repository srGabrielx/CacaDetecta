/**
 * Generates an in-browser playable video blob for demonstration and review
 * when testing without an external video file.
 */
export async function createDemoVideoBlob(width = 1280, height = 720, durationSec = 10, fps = 30): Promise<string> {
  if (typeof window === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const stream = canvas.captureStream(fps);

  // Use MediaRecorder to generate a real playable video blob
  const mimeTypes = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  const mimeType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';

  if (!mimeType) {
    return '';
  }

  return new Promise((resolve) => {
    try {
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(URL.createObjectURL(blob));
      };

      recorder.start();

      let f = 0;
      const totalFrames = durationSec * fps;
      const interval = setInterval(() => {
        if (f >= totalFrames) {
          clearInterval(interval);
          recorder.stop();
          return;
        }

        // Draw realistic high-angle surveillance background
        ctx.fillStyle = '#18181B'; // dark asphalt/street
        ctx.fillRect(0, 0, width, height);

        // Street lanes / pavement markings
        ctx.strokeStyle = '#27272A';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        ctx.lineTo(width, height * 0.5);
        ctx.stroke();

        ctx.strokeStyle = '#3F3F46';
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        ctx.lineTo(width, height * 0.7);
        ctx.stroke();
        ctx.setLineDash([]);

        // Distant background buildings
        ctx.fillStyle = '#111113';
        ctx.fillRect(0, 0, width, height * 0.35);

        // Street lamp posts & wires (the occlusion scenario mentioned in prompt)
        ctx.strokeStyle = '#52525B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.25);
        ctx.lineTo(width, height * 0.28);
        ctx.stroke();

        // Pole in the middle that occludes Person #7
        ctx.fillStyle = '#71717A';
        ctx.fillRect(width * 0.42, height * 0.2, 14, height * 0.6);

        // Moving pedestrian silhouettes (real video backdrop)
        const t = f / fps;
        for (let i = 1; i <= 10; i++) {
          const px = ((i * 0.12 + t * 0.03 * (i % 2 === 0 ? -1 : 1) + 1) % 1) * width;
          const py = (0.45 + (i % 4) * 0.12) * height;
          const h = 40 + (py / height) * 35;
          const w = h * 0.4;

          ctx.fillStyle = '#222226';
          ctx.beginPath();
          ctx.ellipse(px, py, w / 2, h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        f++;
      }, 1000 / fps);
    } catch (e) {
      console.warn('MediaRecorder error:', e);
      resolve('');
    }
  });
}
