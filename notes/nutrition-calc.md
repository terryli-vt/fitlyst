# Nutrition Calculation Logic
# 营养计算逻辑说明

This document explains how Fitlyst calculates a user's daily calorie target and macro breakdown.
本文档说明 Fitlyst 如何计算用户的每日热量目标和三大营养素分配。

Source: `src/features/onboarding/utils/calculateNutrition.ts`

---

## Overview / 总览

The calculation follows this pipeline:
计算流程如下：

```
User inputs → Unit conversion → BMR → TDEE → Daily Calories → Calorie Floor → Macros
用户输入    →   单位换算     → 基础代谢 → 总消耗 →  每日热量目标  →  热量底线   → 宏量素分配
```

---

## Step 1: Unit Conversion / 单位换算

All inputs are first normalized to metric units before any calculation.
所有输入值在计算前统一换算为公制单位。

| Input | Conversion |
|---|---|
| Height in ft/in | `feet × 30.48 + inches × 2.54` → cm |
| Height in cm | used as-is |
| Weight in lb | `lbs × 0.453592` → kg |
| Weight in kg | used as-is |

Conversion helpers live in `src/lib/units.ts` (`heightToCm`, `weightToKg`).

---

## Step 2: BMI / 体质指数

```
BMI = weight (kg) / height (m)²
BMI = 体重 (kg) / 身高 (m)²
```

Stored and displayed on the profile page. Not used in calorie calculation, but used to determine the protein weight basis (see Step 6).
BMI 存储并显示在个人资料页，不直接参与热量计算，但用于判断蛋白质计算基准（见 Step 6）。

---

## Step 3: BMR (Basal Metabolic Rate) / 基础代谢率

Uses the **Mifflin-St Jeor Equation** — considered more accurate than the older Harris-Benedict formula.
采用 **Mifflin-St Jeor 公式**，其精度高于旧版 Harris-Benedict 公式。

```
Base BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age

Male:   BMR = Base BMR + 5
Female: BMR = Base BMR − 161
```

BMR represents the calories your body burns at complete rest (just to stay alive).
BMR 是身体在完全静息状态下（仅维持生命体征）所消耗的热量。

---

## Step 4: TDEE (Total Daily Energy Expenditure) / 每日总热量消耗

```
TDEE = BMR × Activity Multiplier
TDEE = 基础代谢率 × 活动系数
```

Activity multipliers (defined in `src/features/onboarding/config.ts`):
活动系数（定义于 `src/features/onboarding/config.ts`）：

| Activity Level / 活动水平 | Multiplier / 系数 |
|---|---|
| Sedentary (little exercise) / 久坐（几乎不运动） | 1.2 |
| Training 1–3 days/week / 每周训练 1–3 天 | 1.375 |
| Training 3–5 days/week / 每周训练 3–5 天 | 1.55 |
| Training 6–7 days/week / 每周训练 6–7 天 | 1.725 |
| Very physical job / athlete / 重体力劳动 / 专业运动员 | 1.9 |

TDEE is how many calories you need per day to maintain your current weight.
TDEE 是维持当前体重所需的每日热量。

---

## Step 5: Daily Calorie Target / 每日热量目标

The final calorie target adjusts TDEE based on the user's **goal** and **goal priority**.
最终热量目标根据用户的**健身目标**和**执行力度**对 TDEE 进行调整。

### Bulking (Muscle Gain) / 增肌

A caloric surplus is added on top of TDEE:
在 TDEE 基础上增加热量盈余：

| Priority / 力度 | Surplus / 盈余 |
|---|---|
| Aggressive / 激进 | +400 kcal |
| Balanced / 均衡 | +325 kcal |
| Conservative / 保守 | +250 kcal |

### Cutting (Fat Loss) / 减脂

A caloric deficit is subtracted from TDEE:
在 TDEE 基础上制造热量缺口：

| Priority / 力度 | Deficit / 缺口 |
|---|---|
| Aggressive / 激进 | −500 kcal |
| Balanced / 均衡 | −400 kcal |
| Conservative / 保守 | −300 kcal |

### Maintaining Weight / 维持体重

Daily calorie target is set exactly to TDEE. No surplus or deficit is applied.
每日热量目标直接等于 TDEE，不增不减。

The **goalPriority** step is skipped in the onboarding flow when this goal is selected, as speed of progress is not applicable. `goalPriority` is stored as `"balanced"` in the database as a neutral default.
选择此目标时，问卷会跳过 **goalPriority（执行力度）** 步骤，因为维持体重不存在进度快慢的概念。数据库中 `goalPriority` 以 `"balanced"` 作为中性默认值存储。

---

## Step 5b: Minimum Calorie Floor / 热量安全底线

Before calculating macros, the daily calorie target is clamped to a safe minimum to prevent dangerously low recommendations. Below these thresholds the body enters starvation mode and muscle loss accelerates.
计算宏量素之前，每日热量目标会被限制在安全最低值之上，防止推荐值过低。低于此阈值，身体会进入饥饿模式，加速肌肉流失。

| Gender / 性别 | Minimum / 最低热量 |
|---|---|
| Female / 女 | 1200 kcal |
| Male / 男 | 1500 kcal |

These are widely accepted clinical minimums. If the calculated target (e.g. very light bodyweight + aggressive cut + sedentary) falls below this floor, it is raised to the minimum automatically.
这是被广泛认可的临床安全底线。若计算结果低于此值（如极轻体重 + 激进减脂 + 久坐），系统会自动将目标提升至最低值。

---

## Step 6: Macro Breakdown / 宏量素分配

Macros are calculated from bodyweight, then carbs fill the remaining calories.
蛋白质和脂肪先按体重计算，剩余热量全部分配给碳水化合物。

### Protein by goal / 蛋白质按目标差异化

Protein targets differ by goal to reflect different physiological priorities:
蛋白质目标因健身目标不同而差异化，以反映不同的生理需求：

| Goal / 目标 | Protein multiplier / 蛋白质系数 | Rationale / 依据 |
|---|---|---|
| Cut / 减脂 | `× 2.2 g/kg` | Higher intake preserves lean mass during a caloric deficit (ISSN). / 热量缺口期提高蛋白质摄入可防止肌肉流失（ISSN）。 |
| Bulk / 增肌 | `× 2.0 g/kg` | Sufficient to maximise muscle protein synthesis. / 足以最大化肌肉蛋白质合成。 |
| Maintenance / 维持 | `× 2.0 g/kg` | Same as bulk. / 同增肌。 |

| Macro / 营养素 | Formula / 公式 | Calories per gram / 每克热量 |
|---|---|---|
| Protein / 蛋白质 | `protein weight basis (kg) × 2.0 or 2.2` g | 4 kcal/g |
| Fat / 脂肪 | `fat weight basis (kg) × 1` g | 9 kcal/g |
| Carbs / 碳水 | `max(0, daily calories − protein kcal − fat kcal) / 4` g | 4 kcal/g |

**Why this order? / 为什么这样排序？** Protein and fat targets are set first based on body composition needs. Carbs are flexible and absorb whatever calories remain — they're the "lever" that adjusts with the calorie target.
蛋白质和脂肪基于身体组成需求优先确定，碳水化合物灵活填充剩余热量，是随目标浮动的"调节杠杆"。

**Why 1g/kg fat? / 为什么脂肪取 1g/kg？** The ISSN recommends a minimum of 1g/kg fat. 1g/kg keeps fat comfortably within the 20–35% AMDR range across all goals and body weights.
ISSN 建议脂肪摄入不低于 1g/kg 体重。1g/kg 可使脂肪占比在各目标和体型下均保持在 AMDR 推荐区间 20–35% 内。

**Fat weight basis / 脂肪计算基准：** Fat uses the same IBW basis as protein when BMI > 25. Using actual weight for fat while protein uses IBW would cause an inconsistent split — for a 120 kg user with IBW ≈ 67 kg, actual-weight fat alone accounts for ~50% of a cut calorie target, far exceeding the AMDR upper bound of 35%. Applying IBW to both keeps the macro split balanced.
脂肪与蛋白质使用相同的基准：BMI > 25 时均采用理想体重（IBW）。若蛋白质用 IBW 而脂肪用实际体重，会造成比例失衡——以 120kg 用户（IBW ≈ 67kg）减脂为例，仅脂肪一项就会占热量目标的约 50%，远超 AMDR 上限 35%。两者统一使用 IBW 后，宏量素比例恢复正常。

Carbs have a minimum floor of **100g/day**. This prevents accidentally recommending a ketogenic diet (typically < 50g carbs) for users who have not chosen to follow one. 100g is a widely cited sports-nutrition minimum that keeps the brain adequately fuelled. If the floor kicks in, the displayed daily calorie total is raised to match the actual macro calories (protein + fat + carbs), keeping the numbers internally consistent.
碳水设有最低保障值 **100g/天**。这可防止系统在用户未主动选择生酮饮食的情况下意外推荐生酮方案（生酮通常 < 50g 碳水）。100g 是运动营养学中广泛引用的最低摄入量，足以维持大脑正常供能。当底线生效时，每日热量目标也会同步上调以匹配实际三大营养素热量之和，确保数据一致。

### Protein Weight Basis: Actual vs. Ideal Body Weight
### 蛋白质计算基准：实际体重 vs. 理想体重

Protein needs are driven by **lean mass**, not total body mass. Excess adipose tissue does not require additional dietary protein support. Using actual weight for obese users would significantly overestimate protein targets and, as a side effect, leave very little room for carbohydrates.
蛋白质需求取决于**去脂体重**，而非总体重。多余的脂肪组织不需要额外的蛋白质支持。对肥胖用户直接按实际体重计算会严重高估蛋白质需求，并导致碳水化合物几乎无空间分配。

| BMI | Protein basis / 蛋白质基准 |
|---|---|
| ≤ 25（健康 / 偏瘦） | Actual body weight / 实际体重 |
| > 25（超重 / 肥胖） | Ideal Body Weight (IBW) / 理想体重 |

**IBW formula / 理想体重公式：** `IBW (kg) = 22 × height (m)²`

BMI 22 is the midpoint of the healthy BMI range (18.5–25). This means IBW is simply "what the user would weigh at a healthy BMI for their height."
BMI 22 是健康范围（18.5–25）的中间值，即"该身高对应的健康体重"。

**Example / 示例：** 120 kg male, 175 cm (BMI ≈ 39)
- Without adjustment / 未调整：`120 × 2 = 240g` protein → 960 kcal（碳水几乎为零）
- With IBW adjustment / IBW 调整后：`IBW = 22 × 1.75² ≈ 67 kg` → `67 × 2 = 134g` protein → 536 kcal（宏量素分配均衡）

---

## Full Examples / 完整计算示例

### Example 1 — Normal weight user / 正常体重用户

**Inputs:** Male, 25 years old, 175 cm, 75 kg, trains 3–5 days/week, goal: Cut (Balanced)
**输入：** 男性，25 岁，175 cm，75 kg，每周训练 3–5 天，目标：减脂（均衡）

```
BMR  = (10 × 75) + (6.25 × 175) − (5 × 25) + 5
     = 750 + 1093.75 − 125 + 5
     = 1723.75 kcal

TDEE = 1723.75 × 1.55 = 2671.8 kcal

Cut (Balanced, −400) → Daily target = 2272 kcal

BMI = 75 / 1.75² = 24.5  →  uses actual weight for protein / 使用实际体重计算蛋白质

Protein = 75 × 2.2 = 165g  → 660 kcal
Fat     = 75 × 1   = 75g   → 675 kcal
Carbs   = (2272 − 660 − 675) / 4 = 234g
```

### Example 1b — Normal weight male, bulk balanced / 正常体重男性，增肌均衡

```
TDEE = 2671.8 kcal  →  Bulk (Balanced, +325) = 2997 kcal
BMI = 24.5  →  actual weight

Protein = 75 × 2.0 = 150g  → 600 kcal  (20%)
Fat     = 75 × 1   = 75g   → 675 kcal  (22%)
Carbs   = (2997 − 600 − 675) / 4 = 430g → (57%)
```

### Example 1c — Normal weight male, maintain / 正常体重男性，维持体重

```
TDEE = 2671.8 → 2672 kcal  (no adjustment)

Protein = 75 × 2.0 = 150g  → 600 kcal  (22%)
Fat     = 75 × 1   = 75g   → 675 kcal  (25%)
Carbs   = (2672 − 600 − 675) / 4 = 349g → (52%)
```

### Example 2 — Obese user (IBW adjustment) / 肥胖用户（理想体重调整）

**Inputs:** Male, 35 years old, 175 cm, 120 kg, sedentary, goal: Cut (Balanced)
**输入：** 男性，35 岁，175 cm，120 kg，久坐，目标：减脂（均衡）

```
BMR  = (10 × 120) + (6.25 × 175) − (5 × 35) + 5
     = 1200 + 1093.75 − 175 + 5
     = 2123.75 kcal

TDEE = 2123.75 × 1.2 = 2548.5 kcal

Cut (Balanced, −400) → Daily target = 2149 kcal

BMI = 120 / 1.75² ≈ 39.2  →  BMI > 25，使用理想体重 (IBW)

IBW = 22 × 1.75² = 67.4 kg

IBW = 67.4 kg  →  used as basis for both protein and fat
蛋白质与脂肪均使用理想体重作为计算基准

Protein = 67.4 × 2.2 = 148g  → 592 kcal  (28%)
Fat     = 67.4 × 1   = 67g   → 603 kcal  (28%)
Carbs   = (2149 − 592 − 603) / 4 = 239g  → (44%)
```

### Example 3 — Small female, aggressive cut with safety floors / 轻体重女性，激进减脂（安全底线触发）

**Inputs:** Female, 25 years old, 160 cm, 50 kg, sedentary, goal: Cut (Aggressive)
**输入：** 女性，25 岁，160 cm，50 kg，久坐，目标：减脂（激进）

```
BMR  = (10 × 50) + (6.25 × 160) − (5 × 25) − 161 = 1214 kcal
TDEE = 1214 × 1.2 = 1456.8 kcal
Cut (Aggressive, −500) → 956.8 kcal

⚠ Calorie floor triggered (female min 1200) → raised to 1200 kcal
⚠ 热量底线触发（女性最低 1200 kcal）→ 上调至 1200 kcal

BMI = 19.5  →  actual weight

Protein = 50 × 2.2 = 110g  → 440 kcal
Fat     = 50 × 1   = 50g   → 450 kcal
Raw carbs = (1200 − 440 − 450) / 4 = 77g

⚠ Carb floor triggered (min 100g) → raised to 100g → 400 kcal
⚠ 碳水底线触发（最低 100g）→ 上调至 100g
  dailyCalories updated: 440 + 450 + 400 = 1290 kcal

Final: 1290 kcal  |  Protein 110g (34%)  |  Fat 50g (35%)  |  Carbs 100g (31%)
```

### Example 4 — Overweight female, maintain / 超重女性，维持体重

**Inputs:** Female, 45 years old, 163 cm, 80 kg, training 1–3 days/week
**输入：** 女性，45 岁，163 cm，80 kg，每周训练 1–3 天

```
BMR  = (10 × 80) + (6.25 × 163) − (5 × 45) − 161 = 1432.75 kcal
TDEE = 1432.75 × 1.375 = 1970 kcal  (maintain)

BMI = 30.1  →  IBW = 22 × 1.63² = 58.5 kg

Protein = 58.5 × 2.0 = 117g  → 468 kcal  (24%)
Fat     = 58.5 × 1   = 59g   → 531 kcal  (27%)
Carbs   = (1970 − 468 − 531) / 4 = 243g  → (49%)
```

### Example 5 — Very active male, aggressive bulk / 高活动量男性，激进增肌（脂肪占比边界场景）

**Inputs:** Male, 22 years old, 180 cm, 80 kg, very active (1.9), goal: Bulk (Aggressive)
**输入：** 男性，22 岁，180 cm，80 kg，高强度运动（系数 1.9），目标：增肌（激进）

```
BMR  = (10 × 80) + (6.25 × 180) − (5 × 22) + 5 = 1820 kcal
TDEE = 1820 × 1.9 = 3458 kcal
Bulk (Aggressive, +400) → 3858 kcal

BMI = 24.7  →  actual weight

Protein = 80 × 2.0 = 160g  → 640 kcal  (17%)
Fat     = 80 × 1   = 80g   → 720 kcal  (19%)  ← near AMDR lower bound of 20%
Carbs   = (3858 − 640 − 720) / 4 = 624g → (65%)
```

> **Note / 注意：** At very high calorie targets (>3500 kcal), fixed g/kg fat can dip just below the AMDR 20% lower bound (~19%). This is a known edge case for extremely active bulking users; the absolute fat intake (80g) remains adequate.
> 在极高热量目标（>3500 kcal）下，固定 g/kg 脂肪占比可能略低于 AMDR 下限 20%（约 19%）。这是高活动量增肌用户的已知边界场景；脂肪绝对摄入量（80g）仍在合理范围内。