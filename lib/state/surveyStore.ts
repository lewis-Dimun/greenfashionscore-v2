import { create } from "zustand";

export type SurveyDraft = {
  stepIndex: number;
  answers: Record<string, string>;
};

type Store = SurveyDraft & {
  setStepIndex: (i: number) => void;
  setAnswer: (q: string, a: string) => void;
  reset: () => void;
};

const KEY = "gfs_survey_draft";

function loadDraft(): SurveyDraft {
  if (typeof window === "undefined") return { stepIndex: 0, answers: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { stepIndex: 0, answers: {} };
    const parsed = JSON.parse(raw);
    return { stepIndex: Number(parsed.stepIndex) || 0, answers: parsed.answers || {} };
  } catch {
    return { stepIndex: 0, answers: {} };
  }
}

function saveDraft(draft: SurveyDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {}
}

export const useSurveyStore = create<Store>((set, get) => ({
  ...loadDraft(),
  setStepIndex: (i) => {
    const next = { ...get(), stepIndex: i };
    saveDraft({ stepIndex: next.stepIndex, answers: next.answers });
    set({ stepIndex: i });
  },
  setAnswer: (q, a) => {
    const next = { ...get().answers, [q]: a };
    saveDraft({ stepIndex: get().stepIndex, answers: next });
    set({ answers: next });
  },
  reset: () => {
    const empty = { stepIndex: 0, answers: {} };
    saveDraft(empty);
    set(empty);
  }
}));


