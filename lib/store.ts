import { create } from 'zustand';
import { CameraFeed, IdentifiedPerson, SecurityAlert } from '@/types/caca';
import { INITIAL_CAMERAS, INITIAL_PERSONS, INITIAL_ALERTS } from '@/lib/caca-mock-data';

interface ActivityStats {
  trabalhando: number;
  reuniao: number;
  emMovimento: number;
  outros: number;
}

interface CacaStore {
  // Cameras
  cameras: CameraFeed[];
  setCameras: (updater: (prev: CameraFeed[]) => CameraFeed[]) => void;
  
  // Persons
  persons: IdentifiedPerson[];
  setPersons: (persons: IdentifiedPerson[]) => void;
  
  // Alerts
  alerts: SecurityAlert[];
  setAlerts: (updater: (prev: SecurityAlert[]) => SecurityAlert[]) => void;
  acknowledgeAlert: (alertId: string) => void;
  
  // Stats
  activityStats: ActivityStats;
  productivityScore: number;
  handleAnalysisComplete: (data: {
    totalPersons: number;
    activitySummary: { trabalhando: number; reuniao: number; caminhando: number; outros: number };
    productivityScore: number;
  }, selectedCameraId: string) => void;
}

export const useCacaStore = create<CacaStore>((set) => ({
  cameras: INITIAL_CAMERAS,
  setCameras: (updater) => set((state) => ({ cameras: updater(state.cameras) })),
  
  persons: INITIAL_PERSONS,
  setPersons: (persons) => set({ persons }),
  
  alerts: INITIAL_ALERTS,
  setAlerts: (updater) => set((state) => ({ alerts: updater(state.alerts) })),
  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a))
  })),
  
  activityStats: {
    trabalhando: 8,
    reuniao: 2,
    emMovimento: 2,
    outros: 0,
  },
  productivityScore: 94.2,
  handleAnalysisComplete: (data, selectedCameraId) => set((state) => ({
    activityStats: {
      trabalhando: data.activitySummary.trabalhando,
      reuniao: data.activitySummary.reuniao,
      emMovimento: data.activitySummary.caminhando,
      outros: data.activitySummary.outros,
    },
    productivityScore: data.productivityScore,
    cameras: state.cameras.map((cam) =>
      cam.id === selectedCameraId ? { ...cam, personsCount: data.totalPersons } : cam
    ),
  })),
}));
