import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.PROCESSING_API_URL?.trim();
  const searchParams = req.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'JOB_ID_REQUIRED', message: 'ID do trabalho é obrigatório' }, { status: 400 });
  }

  if (!backendUrl) {
    return NextResponse.json(
      {
        error: 'PROCESSING_API_URL_NOT_CONFIGURED',
        message: 'Backend de visão computacional não configurado.',
      },
      { status: 503 }
    );
  }

  try {
    const targetUrl = `${backendUrl.replace(/\/+$/, '')}/api/v1/jobs/${encodeURIComponent(jobId)}/status`;
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'BACKEND_STATUS_ERROR', message: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 'STATUS_FETCH_FAILED', message: err.message }, { status: 500 });
  }
}
