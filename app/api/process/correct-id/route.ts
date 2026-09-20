import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const backendUrl = process.env.PROCESSING_API_URL?.trim();

  try {
    const body = await req.json();
    const { jobId, sourceTrackId, targetTrackId, fromFrame, toFrame } = body;

    if (!jobId || sourceTrackId === undefined || targetTrackId === undefined) {
      return NextResponse.json({ error: 'MISSING_FIELDS', message: 'Campos obrigatórios faltando.' }, { status: 400 });
    }

    if (backendUrl) {
      const targetUrl = `${backendUrl.replace(/\/+$/, '')}/api/v1/jobs/${encodeURIComponent(jobId)}/correct-id`;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceTrackId, targetTrackId, fromFrame, toFrame }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ error: 'CORRECTION_FAILED', message: errText }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // If client is operating on local loaded dataset
    return NextResponse.json({
      status: 'success',
      message: `ID #${sourceTrackId} reconciliado para #${targetTrackId}.`,
      updatedDetections: 1,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'REQUEST_FAILED', message: err.message }, { status: 500 });
  }
}
