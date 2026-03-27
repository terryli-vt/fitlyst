# Nutrition Calculation Logic

This document explains how Fitlyst calculates a user's daily calorie target and macro breakdown.
Source: `src/features/onboarding/utils/calculateNutrition.ts`

---

## Overview

The calculation follows this pipeline:

```
User inputs → Unit conversion → BMR → TDEE → Daily Calories → Calorie Floor → Macros
```

---

## Step 1: Unit Conversion

All inputs are first normalized to metric units before any calculation.

| Input | Conversion |
|---|---|
| Height in ft/in | `feet × 30.48 + inches × 2.54` → cm |
| Height in cm | used as-is |
| Weight in lb | `lbs × 0.453592` → kg |
| Weight in kg | used as-is |

Conversion helpers live in `src/lib/units.ts` (`heightToCm`, `weightToKg`).

---

## Step 2: BMI

```
BMI = weight (kg) / height (m)²
```

Stored and displayed on the profile page. Not used in calorie calculation.

---

## Step 3: BMR (Basal Metabolic Rate)

Uses the **Mifflin-St Jeor Equation** — considered more accurate than the older Harris-Benedict formula.

```
Base BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age

Male:   BMR = Base BMR + 5
Female: BMR = Base BMR − 161
```

BMR represents the calories your body burns at complete rest (just to stay alive).

---

## Step 4: TDEE (Total Daily Energy Expenditure)

```
TDEE = BMR × Activity Multiplier
```

Activity multipliers (defined in `src/features/onboarding/config.ts`):

| Activity Level | Multiplier |
|---|---|
| Sedentary (little exercise) | 1.2 |
| Training 1–3 days/week | 1.375 |
| Training 3–5 days/week | 1.55 |
| Training 6–7 days/week | 1.725 |
| Very physical job / athlete | 1.9 |

TDEE is how many calories you need per day to maintain your current weight.

---

## Step 5: Daily Calorie Target

The final calorie target adjusts TDEE based on the user's **goal** and **goal priority**.

### Bulking (Muscle Gain)

A caloric surplus is added on top of TDEE:

| Priority | Surplus |
|---|---|
| Aggressive | +400 kcal |
| Balanced | +325 kcal |
| Conservative | +250 kcal |

### Cutting (Fat Loss)

A caloric deficit is subtracted from TDEE:

| Priority | Deficit |
|---|---|
| Aggressive | −500 kcal |
| Balanced | −400 kcal |
| Conservative | −300 kcal |

---

## Step 5b: Minimum Calorie Floor

Before calculating macros, the daily calorie target is clamped to a safe minimum to prevent dangerously low recommendations. Below these thresholds the body enters starvation mode and muscle loss accelerates.

| Gender | Minimum |
|---|---|
| Female | 1200 kcal |
| Male | 1500 kcal |

These are widely accepted clinical minimums. If the calculated target (e.g. very light bodyweight + aggressive cut + sedentary) falls below this floor, it is raised to the minimum automatically.

---

## Step 6: Macro Breakdown

Macros are calculated from bodyweight, then carbs fill the remaining calories.

| Macro | Formula | Calories per gram |
|---|---|---|
| Protein | `weight (kg) × 2` g | 4 kcal/g |
| Fat | `weight (kg) × 0.8` g | 9 kcal/g |
| Carbs | `max(0, daily calories − protein kcal − fat kcal) / 4` g | 4 kcal/g |

**Why this order?** Protein and fat targets are set first based on body composition needs. Carbs are flexible and absorb whatever calories remain — they're the "lever" that adjusts with the calorie target.

Carbs are clamped to a minimum of 0g. In edge cases where protein + fat calories already meet or exceed the daily target, carbs will be shown as 0 rather than a negative number.

---

## Full Example

**Inputs:** Male, 25 years old, 175 cm, 75 kg, trains 3–5 days/week, goal: Cut (Balanced)

```
BMR  = (10 × 75) + (6.25 × 175) − (5 × 25) + 5
     = 750 + 1093.75 − 125 + 5
     = 1723.75 kcal

TDEE = 1723.75 × 1.55 = 2671.8 kcal

Cut (Balanced, −400) → Daily target = 2272 kcal

Protein = 75 × 2     = 150g  → 600 kcal
Fat     = 75 × 0.8   = 60g   → 540 kcal
Carbs   = (2272 − 600 − 540) / 4 = 283g
```
