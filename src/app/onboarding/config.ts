// Step configuration - defines all questions in the flow
export const STEPS = [
  {
    id: 0,
    question: "What's your height?",
    key: "height",
    type: "height",
  },
  {
    id: 1,
    question: "What's your weight?",
    key: "weight",
    type: "weight",
  },
  {
    id: 2,
    question: "How old are you?",
    key: "age",
    type: "number",
  },
  {
    id: 3,
    question: "What's your gender?",
    key: "gender",
    type: "gender",
  },
  {
    id: 4,
    question: "What's your activity level?",
    key: "activityLevel",
    type: "select",
  },
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

// Activity level options with TDEE multipliers
export const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little exercise)", multiplier: 1.2 },
  { value: "light", label: "Training 1–3 days/week", multiplier: 1.375 },
  { value: "moderate", label: "Training 3–5 days/week", multiplier: 1.55 },
  { value: "active", label: "Training 6–7 days/week", multiplier: 1.725 },
  {
    value: "very_active",
    label: "Very physical job / athlete",
    multiplier: 1.9,
  },
] as const;
