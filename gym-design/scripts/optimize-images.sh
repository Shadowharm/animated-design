#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/assets/optimized"

SHARP_CMD=(npx --yes sharp-cli)

mkdir -p "$OUT_DIR"/{banners,benefits,trainers}

# Generate mobile/desktop variants for 1x/2x/3x DPR in AVIF + WebP.
# Usage: gen_set <src> <out-base-no-ext> <mobile-base-width> <desktop-base-width>
gen_set() {
  local src="$1"
  local out_base="$2"
  local mobile_base="$3"
  local desktop_base="$4"

  local dpr widths width suffix

  for profile in mobile desktop; do
    if [[ "$profile" == "mobile" ]]; then
      widths=($mobile_base $((mobile_base * 2)) $((mobile_base * 3)))
      suffix="m"
    else
      widths=($desktop_base $((desktop_base * 2)) $((desktop_base * 3)))
      suffix="d"
    fi

    for dpr in 1 2 3; do
      width="${widths[$((dpr - 1))]}"

      "${SHARP_CMD[@]}" -i "$src" -o "${out_base}-${suffix}-${dpr}x.avif" -f avif -q 48 --effort 6 --autoOrient resize "$width" --withoutEnlargement >/dev/null
      "${SHARP_CMD[@]}" -i "$src" -o "${out_base}-${suffix}-${dpr}x.webp" -f webp -q 68 --effort 6 --smartSubsample --autoOrient resize "$width" --withoutEnlargement >/dev/null
    done
  done
}

# Hero and CTA backgrounds
gen_set "$ROOT_DIR/assets/banners/8276_IMG_8497.jpeg" "$OUT_DIR/banners/hero-main" 768 1440
gen_set "$ROOT_DIR/assets/banners/eed3_IMG_8492.jpeg" "$OUT_DIR/banners/cta-main" 768 1440

# Benefits cards
gen_set "$ROOT_DIR/assets/benefits/af-benefits-affordable-coaches.webp" "$OUT_DIR/benefits/affordable-coaches" 360 200
gen_set "$ROOT_DIR/assets/benefits/af-benefits-anytime-anywhere.webp" "$OUT_DIR/benefits/anytime-anywhere" 360 200
gen_set "$ROOT_DIR/assets/benefits/af-benefits-personalized-plans.webp" "$OUT_DIR/benefits/personalized-plans" 360 200
gen_set "$ROOT_DIR/assets/benefits/sauna-relax-2023-11-27-05-00-45-utc-scaled-1.jpg" "$OUT_DIR/benefits/recovery-zone" 360 200

# Gallery strip
gen_set "$ROOT_DIR/assets/banners/45d0_IMG_8500.jpeg" "$OUT_DIR/banners/gallery-hall" 260 400
gen_set "$ROOT_DIR/assets/banners/eed3_IMG_8492.jpeg" "$OUT_DIR/banners/gallery-equipment" 260 400
gen_set "$ROOT_DIR/assets/banners/ae30_IMG_3154.jpeg" "$OUT_DIR/banners/gallery-machines" 260 400
gen_set "$ROOT_DIR/assets/banners/c853_F2374312-A20F-48CE-BE53-EEE633B954EA.jpeg" "$OUT_DIR/banners/gallery-cardio" 260 400
gen_set "$ROOT_DIR/assets/banners/llp-carousel-combo-brand-1.jpg" "$OUT_DIR/banners/gallery-training" 260 400
gen_set "$ROOT_DIR/assets/banners/llp-carousel-combo-brand-3.jpg" "$OUT_DIR/banners/gallery-atmosphere" 260 400

# Trainers cards
gen_set "$ROOT_DIR/assets/trainers/man1.jpg" "$OUT_DIR/trainers/artem-volkov" 180 240
gen_set "$ROOT_DIR/assets/trainers/woman1.jpg" "$OUT_DIR/trainers/alina-sokolova" 180 240
gen_set "$ROOT_DIR/assets/trainers/man2.jpg" "$OUT_DIR/trainers/dmitry-kim" 180 240
gen_set "$ROOT_DIR/assets/trainers/woman2.jpeg" "$OUT_DIR/trainers/marina-kozlova" 180 240
gen_set "$ROOT_DIR/assets/trainers/man3.jpeg" "$OUT_DIR/trainers/sergey-mikhailov" 180 240

echo "Image optimization completed: $OUT_DIR"
