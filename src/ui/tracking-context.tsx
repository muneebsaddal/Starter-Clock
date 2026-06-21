import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { Feeding, Starter } from "@/domain/models";
import type { FeedingDraft } from "@/domain/validation";
import { getTrackingService } from "@/infrastructure/db/expo-database";

interface TrackingContextValue {
  loading: boolean;
  error: string | null;
  starters: Starter[];
  selectedStarter: Starter | null;
  feedings: Feeding[];
  createStarter(name: string): Promise<Starter>;
  renameStarter(name: string): Promise<void>;
  archiveStarter(): Promise<void>;
  reactivateStarter(id: string): Promise<void>;
  deleteStarter(): Promise<void>;
  saveFeeding(draft: FeedingDraft, id?: string): Promise<Feeding>;
  deleteFeeding(id: string): Promise<void>;
  recordObservedPeak(id: string, observedAtMs: number): Promise<void>;
  attachPhoto(id: string, photo: Feeding["photo"] | null): Promise<void>;
  refresh(): Promise<void>;
  clearError(): void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

export function TrackingProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starters, setStarters] = useState<Starter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const selectedStarter = starters.find((starter) => starter.id === selectedId) ?? starters.find((starter) => starter.status === "active") ?? null;

  const refresh = useCallback(async () => {
    try {
      const service = await getTrackingService();
      const nextStarters = await service.listStarters();
      const nextSelected = nextStarters.find((starter) => starter.id === selectedId && starter.status === "active") ?? nextStarters.find((starter) => starter.status === "active") ?? null;
      const nextFeedings = nextSelected ? await service.listFeedings(nextSelected.id, 30) : [];
      setStarters(nextStarters);
      setSelectedId(nextSelected?.id ?? null);
      setFeedings(nextFeedings);
      setError(null);
    } catch {
      setError("Starter Clock couldn’t open local data. Try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { const timer = setTimeout(() => void refresh(), 0); return () => clearTimeout(timer); }, [refresh]);

  const perform = useCallback(async <T,>(task: () => Promise<T>) => {
    try {
      const result = await task();
      await refresh();
      return result;
    } catch (caught) {
      setError(caught instanceof Error && caught.message.startsWith("Enter") ? caught.message : "Couldn’t save your change. Your entries are still here. Try again.");
      throw caught;
    }
  }, [refresh]);

  const value = useMemo<TrackingContextValue>(() => ({
    loading, error, starters, selectedStarter, feedings, refresh,
    clearError: () => setError(null),
    createStarter: (name) => perform(async () => { const service = await getTrackingService(); const starter = await service.createStarter(name); setSelectedId(starter.id); return starter; }),
    renameStarter: async (name) => { if (!selectedStarter) return; await perform(async () => (await getTrackingService()).renameStarter(selectedStarter.id, name)); },
    archiveStarter: async () => { if (!selectedStarter) return; await perform(async () => (await getTrackingService()).setStarterArchived(selectedStarter.id, true)); },
    reactivateStarter: async (id) => { await perform(async () => { await (await getTrackingService()).setStarterArchived(id, false); setSelectedId(id); }); },
    deleteStarter: async () => { if (!selectedStarter) return; await perform(async () => (await getTrackingService()).deleteStarter(selectedStarter.id)); },
    saveFeeding: (draft, id) => perform(async () => (await getTrackingService()).saveFeeding(draft, id)),
    deleteFeeding: (id) => perform(async () => (await getTrackingService()).deleteFeeding(id)),
    recordObservedPeak: async (id, observedAtMs) => { await perform(async () => (await getTrackingService()).recordObservedPeak(id, observedAtMs)); },
    attachPhoto: async (id, photo) => { await perform(async () => (await getTrackingService()).attachPhoto(id, photo ?? null)); },
  }), [error, feedings, loading, perform, refresh, selectedStarter, starters]);

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) throw new Error("useTracking must be used inside TrackingProvider");
  return context;
}
