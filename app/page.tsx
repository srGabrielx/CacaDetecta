'use client';

import React, { useState } from 'react';
import { CacaHeader } from '@/components/CacaHeader';
import { CacaSidebar } from '@/components/CacaSidebar';
import { CacaMainFeed } from '@/components/CacaMainFeed';
import { CacaRightPanel } from '@/components/CacaRightPanel';
import { CacaCameraGrid } from '@/components/CacaCameraGrid';
import { PersonModal } from '@/components/PersonModal';
import { PessoasView } from '@/components/PessoasView';
import { AlertasView } from '@/components/AlertasView';
import { RelatoriosView } from '@/components/RelatoriosView';
import { ConfiguracoesView } from '@/components/ConfiguracoesView';

// Pipeline steps components from previous architecture
import { StepUpload } from '@/components/StepUpload';
import { StepConfig } from '@/components/StepConfig';
import { StepProcessing } from '@/components/StepProcessing';
import { StepReview } from '@/components/StepReview';
import { StepExport } from '@/components/StepExport';
import { BackendModal } from '@/components/BackendModal';

import { CacaViewTab, CameraFeed, IdentifiedPerson, SecurityAlert } from '@/types/caca';
import { INITIAL_CAMERAS, INITIAL_PERSONS, INITIAL_ALERTS } from '@/lib/caca-mock-data';
import {
  VideoMetadata,
  PipelineConfig,
  VideoProcessingJob,
  BackendStatus,
  FrameTrackingData,
  TrackSummary,
} from '@/types/tracking';
import { PRESET_CONFIGS } from '@/lib/color-utils';
import { createDemoVideoBlob } from '@/lib/sample-video';
import { useCacaStore } from '@/lib/store';

export default function Home() {
  // Navigation View Tab
  const [currentTab, setCurrentTab] = useState<CacaViewTab>('cameras');
  const {
    cameras,
    persons,
    setPersons,
    alerts,
    acknowledgeAlert,
    activityStats,
    productivityScore,
    handleAnalysisComplete,
  } = useCacaStore();
  
  const [selectedPerson, setSelectedPerson] = useState<IdentifiedPerson | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('cam-01');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  // ----------------------------------------------------
  // Pipeline SAM 2 / YOLO state (preserved for 4K video)
  // ----------------------------------------------------
  const [pipelineStep, setPipelineStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [config, setConfig] = useState<PipelineConfig>(PRESET_CONFIGS.maxima_precisao);
  const [job, setJob] = useState<VideoProcessingJob | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);

  const activeCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  const onAnalysisCompleteHandler = (data: {
    totalPersons: number;
    activitySummary: { trabalhando: number; reuniao: number; caminhando: number; outros: number };
    productivityScore: number;
  }) => {
    handleAnalysisComplete(data, selectedCameraId);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  // Video Selection for 4K pipeline
  const handleVideoSelected = (file: File, meta: VideoMetadata, objectUrl: string) => {
    setSelectedFile(file);
    setMetadata(meta);
    setVideoPreviewUrl(objectUrl);
    setPipelineStep(2);
  };

  const handleLoadSample = async () => {
    const demoBlobUrl = await createDemoVideoBlob(1280, 720, 10, 30);
    const sampleMeta: VideoMetadata = {
      name: 'amostra_4k_vigilancia_elevada.mp4',
      sizeBytes: 288358400,
      sizeFormatted: '275.0 MB',
      durationSeconds: 10.0,
      durationFormatted: '0:10',
      width: 2160,
      height: 3840,
      fps: 30,
      totalFrames: 300,
      mimeType: 'video/mp4',
      aspectRatio: '9:16',
      is4KOrHigher: true,
    };
    setMetadata(sampleMeta);
    setVideoPreviewUrl(demoBlobUrl || null);
    setPipelineStep(2);
  };

  const handleStartProcessing = async () => {
    setPipelineStep(3);
    const sampleJob: VideoProcessingJob = {
      jobId: 'job_sample_caca_' + Date.now(),
      status: 'processing',
      config,
      metadata: metadata || undefined,
      progressPercent: 15,
      currentFrame: 45,
      totalFrames: 300,
      detectedPersonsCount: 9,
      activeTracksCount: 9,
      lostTracksCount: 0,
      processingFps: 28.4,
      estimatedRemainingSeconds: 9,
      currentStage: 'YOLOv11 Tiled Detection + SAM 2 Seg',
      logs: [
        '[INIT] Pipeline CAÇA inicializado com sucesso',
        '[TILES] Frame 2160x3840 dividido em tiles sobrepostos de 1280px',
        '[SAM2] Máscaras de corpo geradas com alta fidelidade',
      ],
      createdAt: new Date().toISOString(),
    };
    setJob(sampleJob);

    // Simulate pipeline completion
    setTimeout(() => {
      setJob((prev) =>
        prev
          ? {
              ...prev,
              status: 'completed',
              progressPercent: 100,
              currentFrame: 300,
              currentStage: 'Concluído com Sucesso',
              outputVideoUrl: videoPreviewUrl || undefined,
              tracksSummary: [
                { track_id: 1, first_frame: 0, last_frame: 300, total_frames: 300, confidence_avg: 0.98, color: '#00FF87', state: 'ACTIVE', reconciled: true },
                { track_id: 2, first_frame: 0, last_frame: 300, total_frames: 300, confidence_avg: 0.96, color: '#38BDF8', state: 'ACTIVE', reconciled: true },
              ],
            }
          : null
      );
      setPipelineStep(4);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col font-sans antialiased selection:bg-[#10B981] selection:text-black">
      {/* Top Header matching screenshots */}
      <CacaHeader
        isAiAnalyzing={isAiAnalyzing}
        onOpenSettings={() => setCurrentTab('configuracoes')}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1700px] mx-auto p-2 sm:p-4 gap-3 lg:gap-4 min-w-0">
        {/* Left Sidebar Navigation */}
        <CacaSidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          unreadAlertsCount={unreadAlertsCount}
          totalPersonsToday={12}
        />

        {/* Content Area Based on Tab */}
        {currentTab === 'cameras' && (
          <main className="flex-1 flex flex-col xl:flex-row gap-4 min-w-0">
            {/* Center Main Live View & Camera Grid */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <CacaMainFeed
                currentCamera={activeCamera}
                recentDetections={persons}
                onSelectPerson={(p) => setSelectedPerson(p)}
                onAnalysisComplete={onAnalysisCompleteHandler}
                onOpenUploadPipeline={() => setCurrentTab('pipeline')}
              />

              {/* Bottom 4-Camera Grid Switcher */}
              <CacaCameraGrid
                cameras={cameras}
                selectedCameraId={selectedCameraId}
                onSelectCamera={(id) => setSelectedCameraId(id)}
              />
            </div>

            {/* Right Statistics & Recent Detections Panel */}
            <CacaRightPanel
              totalPersons={12}
              activityStats={activityStats}
              recentDetections={persons}
              onSelectPerson={(p) => setSelectedPerson(p)}
              productivityScore={productivityScore}
            />
          </main>
        )}

        {currentTab === 'pessoas' && (
          <PessoasView
            persons={persons}
            onSelectPerson={(p) => setSelectedPerson(p)}
          />
        )}

        {currentTab === 'alertas' && (
              <AlertasView
                alerts={alerts}
                onAcknowledgeAlert={acknowledgeAlert}
              />
        )}

        {currentTab === 'relatorios' && <RelatoriosView />}

        {currentTab === 'configuracoes' && <ConfiguracoesView />}

        {currentTab === 'pipeline' && (
          <div className="flex-1 flex flex-col gap-4 min-w-0 p-2 md:p-4 bg-[#0D1117] border border-[#232B3A] rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#232B3A]">
              <div>
                <h2 className="text-lg font-black text-white">
                  Pipeline de Processamento em Lote (SAM 2 + YOLO + ReID)
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Projetado especificamente para vídeos 4K pesados com dezenas de pessoas pequenas e oclusões.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((stepNum) => (
                  <button
                    key={stepNum}
                    onClick={() => setPipelineStep(stepNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pipelineStep === stepNum
                        ? 'bg-[#10B981] text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-[#18202D] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {stepNum}
                  </button>
                ))}
              </div>
            </div>

            {pipelineStep === 1 && (
              <StepUpload
                onVideoSelected={handleVideoSelected}
                onLoadSample={handleLoadSample}
                selectedMetadata={metadata}
                videoPreviewUrl={videoPreviewUrl}
                onContinue={() => setPipelineStep(2)}
              />
            )}

            {pipelineStep === 2 && metadata && (
              <StepConfig
                metadata={metadata}
                config={config}
                onChangeConfig={setConfig}
                backendStatus={backendStatus}
                onOpenBackendModal={() => setIsBackendModalOpen(true)}
                onStartProcessing={handleStartProcessing}
                onBack={() => setPipelineStep(1)}
              />
            )}

            {pipelineStep === 3 && job && (
              <StepProcessing
                job={job}
                onCancel={() => setPipelineStep(2)}
                onContinueToReview={() => setPipelineStep(4)}
              />
            )}

            {pipelineStep === 4 && job && (
              <StepReview
                job={job}
                videoSrc={videoPreviewUrl || ''}
                onUpdateJobData={() => {}}
                onContinueToExport={() => setPipelineStep(5)}
              />
            )}

            {pipelineStep === 5 && job && (
              <StepExport
                job={job}
                onRestart={() => {
                  setPipelineStep(1);
                  setSelectedFile(null);
                  setVideoPreviewUrl(null);
                  setMetadata(null);
                  setJob(null);
                }}
                onBackToReview={() => setPipelineStep(4)}
              />
            )}
          </div>
        )}
      </div>

      {/* Identified Person Modal (Screenshot 2) */}
      <PersonModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />

      {/* Backend modal for optional local server */}
      <BackendModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        status={backendStatus}
        onRetryConnection={async () => {}}
        onLoadSampleData={() => {
          setIsBackendModalOpen(false);
          handleLoadSample();
        }}
      />
    </div>
  );
}
