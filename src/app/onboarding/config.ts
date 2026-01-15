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
  {
    id: 5,
    question: "What's your fitness goal?",
    key: "goal",
    type: "goal",
  },
  {
    id: 6,
    question: "How do you want to achieve your goal?",
    key: "goalPriority",
    type: "goalPriority",
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

// Goal options
export const GOAL_OPTIONS = [
  {
    value: "bulk",
    label: "Bulk (Muscle Gain)",
    description: "Increase muscle mass and strength",
  },
  {
    value: "cut",
    label: "Cut (Fat Loss)",
    description: "Reduce body fat while maintaining muscle",
  },
] as const;

// Goal priority options
export const GOAL_PRIORITY_OPTIONS = [
  {
    value: "aggressive",
    label: "Aggressive",
    description:
      "Upper end of calorie range - faster progress (may gain more fat when bulking)",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Middle of calorie range - balanced approach",
  },
  {
    value: "conservative",
    label: "Conservative",
    description: "Lower end of calorie range - slower but leaner progress",
  },
] as const;
