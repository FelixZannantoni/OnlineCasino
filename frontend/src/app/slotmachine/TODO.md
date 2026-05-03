s# Slot Machine SVG Fix TODO

## Plan Breakdown
1. ✅ [DONE] Create TODO.md
2. [PENDING] Edit slotmachine.ts: 
   - Add `svgHtmlReel: SafeHtml` to SlotSymbol interface (svgFn(100)).
   - Precompute in constructor: `svgHtmlReel: this.sanitizer.bypassSecurityTrustHtml(d.svgFn(100))`.
   - Update makeSymNode: use `svgHtmlReel`.
   - Brighten 3 SVG fns (svgSeven, svgDiamond, svgCherry) with vivid colors.
3. [PENDING] Test: Spin reels, verify SVGs visible/animated, no CSP errors.
4. [PENDING] attempt_completion if working.
