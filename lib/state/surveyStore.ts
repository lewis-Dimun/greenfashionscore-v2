import { create } from "zustand";

export type SurveyDraft = {
  stepIndex: number;
  answers: Record<string, string>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
  namespace: string; // userId or 'anon'
};

type Store = SurveyDraft & {
  setStepIndex: (i: number) => void;
  setAnswer: (q: string, a: string) => void;
  setSubmitting: (val: boolean) => void;
  setSubmitted: (val: boolean) => void;
  setSubmitError: (err: string | null) => void;
  setNamespace: (ns: string) => void;
  reset: () => void;
  // Specific survey methods
  loadSpecificDraft: (productType: string) => Record<string, string>;
  saveSpecificDraft: (productType: string, answers: Record<string, string>) => void;
};

function keyFor(ns: string) {
  return `gfs_survey_draft:${ns || 'anon'}`;
}

function specificKeyFor(ns: string, productType: string) {
  return `gfs_specific_draft:${ns || 'anon'}:${productType}`;
}

function loadDraft(ns = 'anon'): SurveyDraft {
  if (typeof window === "undefined") return { stepIndex: 0, answers: {}, isSubmitting: false, isSubmitted: false, submitError: null, namespace: ns };
  try {
    const raw = window.localStorage.getItem(keyFor(ns));
    if (!raw) return { stepIndex: 0, answers: {}, isSubmitting: false, isSubmitted: false, submitError: null, namespace: ns };
    const parsed = JSON.parse(raw);
    return { 
      stepIndex: Number(parsed.stepIndex) || 0, 
      answers: parsed.answers || {},
      isSubmitting: false, // Never persist submitting state
      isSubmitted: false, // Never persist submitted state
      submitError: null, // Never persist error state
      namespace: ns
    };
  } catch {
    return { stepIndex: 0, answers: {}, isSubmitting: false, isSubmitted: false, submitError: null, namespace: ns };
  }
}

function saveDraft(draft: SurveyDraft) {
  if (typeof window === "undefined") return;
  try {
    // Only save stepIndex and answers to localStorage, not submit states
    window.localStorage.setItem(keyFor(draft.namespace), JSON.stringify({
      stepIndex: draft.stepIndex,
      answers: draft.answers
    }));
  } catch {}
}

export const useSurveyStore = create<Store>((set, get) => ({
  ...loadDraft(),
  setStepIndex: (i) => {
    const next = { ...get(), stepIndex: i };
    saveDraft({ stepIndex: next.stepIndex, answers: next.answers, isSubmitting: false, isSubmitted: false, submitError: null, namespace: next.namespace });
    set({ stepIndex: i });
  },
  setAnswer: (q, a) => {
    const next = { ...get().answers, [q]: a };
    const ns = get().namespace;
    saveDraft({ stepIndex: get().stepIndex, answers: next, isSubmitting: false, isSubmitted: false, submitError: null, namespace: ns });
    set({ answers: next });
  },
  setSubmitting: (val) => {
    set({ isSubmitting: val });
  },
  setSubmitted: (val) => {
    set({ isSubmitted: val });
  },
  setSubmitError: (err) => {
    set({ submitError: err });
  },
  setNamespace: (ns) => {
    const current = get();
    if (current.namespace === ns) return;
    const nextDraft = loadDraft(ns);
    set(nextDraft);
  },
  reset: () => {
    const ns = get().namespace;
    const empty = { stepIndex: 0, answers: {}, isSubmitting: false, isSubmitted: false, submitError: null, namespace: ns };
    saveDraft(empty);
    set(empty);
  },
  loadSpecificDraft: (productType: string) => {
    const ns = get().namespace;
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(specificKeyFor(ns, productType));
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed.answers || {};
    } catch {
      return {};
    }
  },
  saveSpecificDraft: (productType: string, answers: Record<string, string>) => {
    const ns = get().namespace;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(specificKeyFor(ns, productType), JSON.stringify({ answers }));
    } catch {}
  }
}));


