const HALOS = [
  { color: "46,107,230", className: "-left-24 -top-24 h-[26rem] w-[26rem]" },
  { color: "255,20,147", className: "-right-24 top-1/3 h-[24rem] w-[24rem]" },
  { color: "255,188,0", className: "-bottom-24 left-1/4 h-[22rem] w-[22rem]" },
];

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      {HALOS.map((halo, i) => (
        <div
          key={i}
          className={`absolute animate-breath rounded-full blur-[100px] ${halo.className}`}
          style={{ background: `radial-gradient(circle, rgba(${halo.color},0.14), transparent 70%)` }}
        />
      ))}
    </div>
  );
}
