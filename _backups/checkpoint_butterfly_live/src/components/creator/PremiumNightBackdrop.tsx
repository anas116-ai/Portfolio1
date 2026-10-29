/* Premium night backdrop — calm neutral luxury.
 *
 * A soft top spotlight over flat obsidian. Lives behind content (z-0),
 * alphas stay low, nothing animates — luxury is restraint, not motion.
 */

export function PremiumNightBackdrop({
  side = "right",
  mood = "calm",
}: {
  side?: "left" | "right";
  mood?: "stage" | "calm";
}) {
  void side;
  const spot = mood === "stage" ? 0.07 : 0.045;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Single soft top spotlight — neutral bone light only */}
      <div
        className="absolute left-1/2 top-[-160px] h-[320px] w-[640px] -translate-x-1/2 blur-[90px]"
        style={{
          backgroundImage: `radial-gradient(ellipse_at_center, rgba(244,245,239,${spot}) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
