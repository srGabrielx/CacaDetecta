import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.PROCESSING_API_URL?.trim();
  const searchParams = req.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');
  const format = searchParams.get('format') || 'mp4';

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
    const targetUrl = `${backendUrl.replace(/\/+$/, '')}/api/v1/jobs/${encodeURIComponent(jobId)}/download?format=${encodeURIComponent(format)}`;
    const res = await fetch(targetUrl);

    if (!res.ok) {
      return NextResponse.json({ error: 'DOWNLOAD_FAILED', status: res.status }, { status: res.status });
    }

    const contentType = format === 'json' ? 'application/json' : 'video/mp4';
    const filename = format === 'json' ? `tracking_${jobId}.json` : `persontrack_${jobId}.mp4`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the binary file to browser
    return new NextResponse(res.body as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'DOWNLOAD_ERROR', message: err.message }, { status: 500 });
  }
}
