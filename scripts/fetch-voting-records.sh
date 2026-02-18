#!/bin/bash
# Fetch and parse NB City Council minutes PDFs from Legistar
# Usage: ./fetch-voting-records.sh
# Outputs: /tmp/nb-minutes-text/ directory with .txt files per meeting

set -e

OUTPUT_DIR="/tmp/nb-minutes-text"
mkdir -p "$OUTPUT_DIR"

# Known City Council regular meeting minutes URLs from Legistar (Feb 2025 - Feb 2026)
# Format: YYYY-MM-DD|URL
MEETINGS=(
  "2026-01-27|https://newbraunfels.legistar1.com/newbraunfels/meetings/2026/1/5731_M_City_Council_26-01-27_Minutes.pdf"
  "2025-12-09|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/12/5710_M_City_Council_25-12-09_Minutes.pdf"
  "2025-11-24|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/11/5641_M_City_Council_25-11-24_Minutes.pdf"
  "2025-11-10|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/11/5678_M_City_Council_25-11-10_Minutes.pdf"
  "2025-10-27|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/10/5633_M_City_Council_25-10-27_Minutes.pdf"
  "2025-10-13|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/10/5617_M_City_Council_25-10-13_Minutes.pdf"
  "2025-09-22|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/9/5606_M_City_Council_25-09-22_Minutes.pdf"
  "2025-09-08|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/9/5591_M_City_Council_25-09-08_Minutes.pdf"
  "2025-08-25|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/8/5576_M_City_Council_25-08-25_Minutes.pdf"
  "2025-07-28|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/7/5554_M_City_Council_25-07-28_Minutes.pdf"
  "2025-07-14|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/7/5540_M_City_Council_25-07-14_Minutes.pdf"
  "2025-06-23|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/6/5526_M_City_Council_25-06-23_Minutes.pdf"
  "2025-06-09|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/6/5513_M_City_Council_25-06-09_Minutes.pdf"
  "2025-05-27|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/5/5499_M_City_Council_25-05-27_Minutes.pdf"
  "2025-04-28|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/4/5474_M_City_Council_25-04-28_Minutes.pdf"
  "2025-04-14|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/4/5461_M_City_Council_25-04-14_Minutes.pdf"
  "2025-03-24|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/3/5447_M_City_Council_25-03-24_Minutes.pdf"
  "2025-03-10|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/3/5433_M_City_Council_25-03-10_Minutes.pdf"
  "2025-02-24|https://newbraunfels.legistar1.com/newbraunfels/meetings/2025/2/5419_M_City_Council_25-02-24_Minutes.pdf"
)

echo "Fetching and converting ${#MEETINGS[@]} minutes PDFs..."

for entry in "${MEETINGS[@]}"; do
  DATE="${entry%%|*}"
  URL="${entry##*|}"
  OUTFILE="$OUTPUT_DIR/$DATE.txt"

  if [ -f "$OUTFILE" ]; then
    echo "  SKIP $DATE (already converted)"
    continue
  fi

  TMPDF="/tmp/nb-minutes-$DATE.pdf"
  echo -n "  Fetching $DATE... "
  HTTP_CODE=$(curl -s -o "$TMPDF" -w "%{http_code}" "$URL")

  if [ "$HTTP_CODE" = "200" ] && [ -s "$TMPDF" ]; then
    pdftotext "$TMPDF" "$OUTFILE" 2>/dev/null && echo "OK" || echo "PARSE FAILED"
    rm -f "$TMPDF"
  else
    echo "HTTP $HTTP_CODE - SKIPPED"
    rm -f "$TMPDF"
  fi
done

echo ""
echo "Done. Text files in $OUTPUT_DIR:"
ls -la "$OUTPUT_DIR"/*.txt 2>/dev/null | awk '{print $NF, $5}'
