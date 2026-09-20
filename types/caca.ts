export type CacaViewTab = 'cameras' | 'pessoas' | 'alertas' | 'relatorios' | 'configuracoes' | 'pipeline';

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'recording' | 'standby';
  personsCount: number;
  fps: number;
  resolution: string;
  thumbnailUrl?: string;
  activeActivity: string;
}

export interface IdentifiedPerson {
  id: string;
  name: string;
  role: string;
  department: string;
  entryTime: string;
  location: string;
  confidence: number;
  status: 'present' | 'in_transit' | 'departed';
  photoUrl: string;
  badgeId: string;
  detectionsCountToday: number;
}

export interface LiveDetection {
  id: number;
  label: string;
  activity: 'Trabalhando' | 'Caminhando' | 'Reunião' | 'Outros';
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  identifiedName?: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'alert';
  title: string;
  description: string;
  camera: string;
  read: boolean;
}
