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
    question: "What's your activity level?",
    key: "activityLevel",
    type: "select",
  },
] as const;

// Activity level options
export const ACTIVITY_LEVELS = [
  { value: "low", label: "Low (sedentary, little exercise)" },
  { value: "medium", label: "Medium (moderate exercise 3-5 days/week)" },
  { value: "high", label: "High (intense exercise 6-7 days/week)" },
] as const;
