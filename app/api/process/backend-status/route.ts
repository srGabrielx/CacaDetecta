import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.PROCESSING_API_URL?.trim();

  if (!backendUrl) {
    return NextResponse.json({
      configured: false,
      reachable: false,
      message: 'A variável de ambiente PROCESSING_API_URL não foi definida. Conecte um backend Python/FastAPI com GPU para processar vídeos 4K nativamente.',
    });
  }

  const startTime = Date.now();
  try {
    const healthUrl = backendUrl.replace(/\/+$/, '') + '/health';
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return NextResponse.json({
        configured: true,
        url: backendUrl,
        reachable: false,
        latencyMs,
        message: `Backend retornou status HTTP ${response.status}`,
      });
    }

    const data = await response.json();

    return NextResponse.json({
      configured: true,
      url: backendUrl,
      reachable: true,
      gpuAvailable: data.gpuAvailable ?? false,
      gpuName: data.gpuName ?? 'Não especificado',
      modelsLoaded: data.modelsLoaded ?? {},
      latencyMs,
      version: data.version ?? '1.0.0',
      message: 'Backend Python CV conectado e pronto para processar.',
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: true,
      url: backendUrl,
      reachable: false,
      latencyMs: Date.now() - startTime,
      message: `Não foi possível conectar ao backend em ${backendUrl}: ${err.message || 'Timeout de conexão'}`,
    });
  }
}
