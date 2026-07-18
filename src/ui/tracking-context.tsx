import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { AppState } from "react-native";
import type { Feeding, Starter } from "@/domain/models";
import type { EntitlementSnapshot } from "@/application/entitlement-service";
import type { StorePurchaseResult } from "@/application/ports";
import type { FeedingDraft } from "@/domain/validation";
import { getTrackingService } from "@/infrastructure/db/expo-database";

interface TrackingContextValue {
  loading: boolean;
  error: string | null;
  starters: Starter[];
  selectedStarter: Starter | null;
  feedings: Feeding[];
  hasMoreFeedings: boolean;
  loadingMoreFeedings: boolean;
  entitlement: EntitlementSnapshot;
  reminderDefault: boolean;
  createStarter(name: string): Promise<Starter>;
  renameStarter(name: string): Promise<void>;
  archiveStarter(): Promise<void>;
  reactivateStarter(id: string): Promise<void>;
  deleteStarter(): Promise<void>;
  saveFeeding(draft: FeedingDraft, id?: string): Promise<Feeding>;
  deleteFeeding(id: string): Promise<void>;
  recordObservedPeak(id: string, observedAtMs: number): Promise<void>;
  attachPhoto(id: string, photo: Feeding["photo"] | null): Promise<void>;
  selectStarter(id: string): Promise<void>;
  purchaseLifetime(): Promise<StorePurchaseResult>;
  restorePurchases(): Promise<EntitlementSnapshot>;
  exportData(): Promise<string>;
  deleteAllData(): Promise<void>;
  refresh(): Promise<void>;
  loadMoreFeedings(): Promise<void>;
  clearError(): void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);
const HISTORY_PAGE_SIZE = 100;

export function TrackingProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starters, setStarters] = useState<Starter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [hasMoreFeedings, setHasMoreFeedings] = useState(false);
  const [loadingMoreFeedings, setLoadingMoreFeedings] = useState(false);
  const [entitlement, setEntitlement] = useState<EntitlementSnapshot>({ productId: "starter_clock_pro_lifetime", level: "free", store: "unknown", lastVerifiedAtMs: null, offline: false });
  const [reminderDefault, setReminderDefault] = useState(true);
  const selectedStarter = starters.find((starter) => starter.id === selectedId) ?? starters.find((starter) => starter.status === "active") ?? null;

  const refresh = useCallback(async () => {
    try {
      const service = await getTrackingService();
      const nextStarters = await service.listStarters();
      const persistedSelectedId = selectedId ?? await service.getSelectedStarterId();
      const nextSelected = nextStarters.find((starter) => starter.id === persistedSelectedId && starter.status === "active") ?? nextStarters.find((starter) => starter.status === "active") ?? null;
      const [feedingPage, nextEntitlement, nextReminderDefault] = await Promise.all([
        nextSelected ? service.listFeedings(nextSelected.id, HISTORY_PAGE_SIZE + 1) : [],
        service.getEntitlement(),
        service.getReminderDefault(),
      ]);
      setStarters(nextStarters);
      setSelectedId(nextSelected?.id ?? null);
      await service.setSelectedStarterId(nextSelected?.id ?? null);
      setFeedings(feedingPage.slice(0, HISTORY_PAGE_SIZE));
      setHasMoreFeedings(feedingPage.length > HISTORY_PAGE_SIZE);
      setEntitlement(nextEntitlement);
      setReminderDefault(nextReminderDefault);
      setError(null);
    } catch {
      setError("Starter Clock couldn’t open local data. Try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  const loadMoreFeedings = useCallback(async () => {
    if (!selectedStarter || entitlement.level !== "pro" || !hasMoreFeedings || loadingMoreFeedings) return;
    setLoadingMoreFeedings(true);
    try {
      const page = await (await getTrackingService()).listFeedings(selectedStarter.id, HISTORY_PAGE_SIZE + 1, feedings.length);
      const additions = page.slice(0, HISTORY_PAGE_SIZE);
      setFeedings((current) => {
        const existingIds = new Set(current.map((feeding) => feeding.id));
        return [...current, ...additions.filter((feeding) => !existingIds.has(feeding.id))];
      });
      setHasMoreFeedings(page.length > HISTORY_PAGE_SIZE);
    } catch {
      setError("Couldn’t load more feeding history. Try again.");
    } finally {
      setLoadingMoreFeedings(false);
    }
  }, [entitlement.level, feedings.length, hasMoreFeedings, loadingMoreFeedings, selectedStarter]);

  useEffect(() => { const timer = setTimeout(() => void refresh(), 0); return () => clearTimeout(timer); }, [refresh]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void getTrackingService().then((service) => service.reconcileCapabilities()).then(refresh);
    });
    return () => subscription.remove();
  }, [refresh]);

  const perform = useCallback(async <T,>(task: () => Promise<T>) => {
    try {
      const result = await task();
      await refresh();
      return result;
    } catch (caught) {
      setError(caught instanceof Error && caught.message === "FREE_STARTER_LIMIT" ? "Free includes one active starter. Lifetime Pro unlocks more." : caught instanceof Error && caught.message.startsWith("Enter") ? caught.message : "Couldn’t save your change. Your entries are still here. Try again.");
      throw caught;
    }
  }, [refresh]);

  const value = useMemo<TrackingContextValue>(() => ({
    loading, error, starters, selectedStarter, feedings, hasMoreFeedings, loadingMoreFeedings, entitlement, reminderDefault, refresh, loadMoreFeedings,
    clearError: () => setError(null),
    createStarter: (name) => perform(async () => { const service = await getTrackingService(); const starter = await service.createStarter(name); await service.setSelectedStarterId(starter.id); setSelectedId(starter.id); return starter; }),
    renameStarter: async (name) => { if (!selectedStarter) return; await perform(async () => (await getTrackingService()).renameStarter(selectedStarter.id, name)); },
    archiveStarter: async () => { if (!selectedStarter) return; await perform(async () => (await getTrackingService()).setStarterArchived(selectedStarter.id, true)); },
    reactivateStarter: async (id) => { await perform(async () => { await (await getTrackingService()).setStarterArchived(id, false); setSelectedId(id); }); },
    deleteStarter: async () => { if (!selectedStarter) return; await perform(async () => (await getTrackingService()).deleteStarter(selectedStarter.id)); },
    saveFeeding: (draft, id) => perform(async () => (await getTrackingService()).saveFeeding(draft, id)),
    deleteFeeding: (id) => perform(async () => (await getTrackingService()).deleteFeeding(id)),
    recordObservedPeak: async (id, observedAtMs) => { await perform(async () => (await getTrackingService()).recordObservedPeak(id, observedAtMs)); },
    attachPhoto: async (id, photo) => { await perform(async () => (await getTrackingService()).attachPhoto(id, photo ?? null)); },
    selectStarter: async (id) => { if (entitlement.level !== "pro") return; const service = await getTrackingService(); await service.setSelectedStarterId(id); setSelectedId(id); },
    purchaseLifetime: async () => { const result = await (await getTrackingService()).purchaseLifetime(); await refresh(); return result; },
    restorePurchases: async () => { const result = await (await getTrackingService()).restorePurchases(); await refresh(); return result; },
    exportData: async () => {
      const { shareStarterClockExport } = await import("@/infrastructure/files/data-export");
      return shareStarterClockExport(await (await getTrackingService()).exportData());
    },
    deleteAllData: async () => {
      await perform(async () => (await getTrackingService()).deleteAllData());
      setSelectedId(null);
    },
  }), [entitlement, error, feedings, hasMoreFeedings, loadMoreFeedings, loading, loadingMoreFeedings, perform, refresh, reminderDefault, selectedStarter, starters]);

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) throw new Error("useTracking must be used inside TrackingProvider");
  return context;
}
