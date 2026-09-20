import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const backendUrl = process.env.PROCESSING_API_URL?.trim();

  if (!backendUrl) {
    return NextResponse.json(
      {
        error: 'PROCESSING_API_URL_NOT_CONFIGURED',
        message:
          'O backend de visão computacional não está conectado. Configure a variável de ambiente PROCESSING_API_URL apontando para o serviço Python/FastAPI (com PyTorch, YOLOv11/v8, SAM 2, BoT-SORT e FFmpeg).',
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const preset = formData.get('preset') as string || 'maxima_precisao';
    const config = formData.get('config') as string || '{}';

    if (!file) {
      return NextResponse.json(
        { error: 'FILE_REQUIRED', message: 'Nenhum arquivo de vídeo MP4 foi enviado.' },
        { status: 400 }
      );
    }

    const forwardFormData = new FormData();
    forwardFormData.append('file', file, file.name);
    forwardFormData.append('preset', preset);
    forwardFormData.append('config', config);

    const targetUrl = backendUrl.replace(/\/+$/, '') + '/api/v1/jobs/upload';

    const backendRes = await fetch(targetUrl, {
      method: 'POST',
      body: forwardFormData,
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      return NextResponse.json(
        { error: 'BACKEND_ERROR', message: `Erro no backend Python: ${errorText}` },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'UPLOAD_FAILED', message: `Falha na transferência do vídeo: ${err.message}` },
      { status: 500 }
    );
  }
}
