import { create } from "zustand";

export type SurveyDraft = {
  stepIndex: number;
  answers: Record<string, string>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
};

type Store = SurveyDraft & {
  setStepIndex: (i: number) => void;
  setAnswer: (q: string, a: string) => void;
  setSubmitting: (val: boolean) => void;
  setSubmitted: (val: boolean) => void;
  setSubmitError: (err: string | null) => void;
  reset: () => void;
};

const KEY = "gfs_survey_draft";

function loadDraft(): SurveyDraft {
  if (typeof window === "undefined") return { stepIndex: 0, answers: {}, isSubmitting: false, isSubmitted: false, submitError: null };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { stepIndex: 0, answers: {}, isSubmitting: false, isSubmitted: false, submitError: null };
    const parsed = JSON.parse(raw);
    return { 
      stepIndex: Number(parsed.stepIndex) || 0, 
      answers: parsed.answers || {},
      isSubmitting: false, // Never persist submitting state
      isSubmitted: false, // Never persist submitted state
      submitError: null // Never persist error state
    };
  } catch {
    return { stepIndex: 0, answers: {}, isSubmitting: false, isSubmitted: false, submitError: null };
  }
}

function saveDraft(draft: SurveyDraft) {
  if (typeof window === "undefined") return;
  try {
    // Only save stepIndex and answers to localStorage, not submit states
    window.localStorage.setItem(KEY, JSON.stringify({
      stepIndex: draft.stepIndex,
      answers: draft.answers
    }));
  } catch {}
}

export const useSurveyStore = create<Store>((set, get) => ({
  ...loadDraft(),
  setStepIndex: (i) => {
    const next = { ...get(), stepIndex: i };
    saveDraft({ stepIndex: next.stepIndex, answers: next.answers, isSubmitting: false, isSubmitted: false, submitError: null });
    set({ stepIndex: i });
  },
  setAnswer: (q, a) => {
    const next = { ...get().answers, [q]: a };
    saveDraft({ stepIndex: get().stepIndex, answers: next, isSubmitting: false, isSubmitted: false, submitError: null });
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
  reset: () => {
    const empty = { stepIndex: 0, answers: {}, isSubmitting: false, isSubmitted: false, submitError: null };
    saveDraft(empty);
    set(empty);
  }
}));


