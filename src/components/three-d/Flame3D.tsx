/**
 * Flamme 3D en CSS pur. Aucune animation continue.
 *
 * La forme vient d'un carre aux rayons asymetriques (0 sur un angle, 50% sur les
 * trois autres) tourne a -45deg : c'est une goutte pointe en haut. Trois couches
 * concentriques de plus en plus petites et decalees vers le bas donnent le
 * volume ; chacune est un radial-gradient, jamais un aplat.
 */
export function Flame3D({ className }: { className?: string }) {
  return (
    <div className={`f3d${className ? ` ${className}` : ""}`} aria-hidden>
      <style>{`
        .f3d{--f3d-h:100px;width:calc(var(--f3d-h) * .78);height:var(--f3d-h);position:relative;
          perspective:480px;flex:none}
        @media (max-width:640px){.f3d{--f3d-h:80px}}

        .f3d-in{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(6deg);
          transition:transform .45s cubic-bezier(.22,1,.36,1)}
        .f3d-g:hover .f3d-in{transform:rotateX(3deg) scale(1.05)}

        /* Halo diffus : donne l'impression que la flamme eclaire son environnement. */
        .f3d-halo{position:absolute;left:2%;top:8%;width:96%;height:80%;border-radius:50%;
          background:radial-gradient(ellipse at 50% 62%,rgba(255,140,40,.42),transparent 68%);
          filter:blur(6px)}

        .f3d-layer{position:absolute;left:50%;border-radius:0 50% 50% 50%;
          transform-origin:center}

        /* L'ordre compte : rotate d'abord (pointe vers le haut), scaleY ensuite
           (etirement vertical). L'inverse produit un croissant couche sur le cote.
           Les transforms s'appliquent de droite a gauche.
           Le degrade tourne avec l'element : en repere local, le bas de la flamme
           est le coin bas-droit, d'ou un centre lumineux vers 68% 70%. */
        .f3d-outer{width:62%;height:62%;top:12%;
          transform:translateX(-50%) scaleY(1.34) rotate(45deg);
          background:radial-gradient(circle at 68% 70%,#FFB259 0%,#FF8A3D 30%,#FF6633 62%,#D8391A 100%);
          box-shadow:0 8px 18px rgba(216,57,26,.34)}

        .f3d-mid{width:42%;height:42%;top:34%;
          transform:translateX(-50%) scaleY(1.3) rotate(45deg);
          background:radial-gradient(circle at 66% 68%,#FFE9A8 0%,#FFC93F 34%,#FFAA00 70%,#E07A00 100%)}

        .f3d-core{width:22%;height:22%;top:56%;
          transform:translateX(-50%) scaleY(1.28) rotate(45deg);
          background:radial-gradient(circle at 62% 64%,#EAFFFF 0%,#9CFFFF 26%,#00FFFF 62%,#00A8C8 100%);
          box-shadow:0 0 10px rgba(0,255,255,.55)}

        /* Reflet le long de l'arete gauche : sinon la flamme parait plate. */
        .f3d-sheen{position:absolute;left:31%;top:22%;width:11%;height:34%;border-radius:50%;
          background:linear-gradient(180deg,rgba(255,255,255,.6),transparent);
          filter:blur(2px);transform:rotate(-12deg)}

        .f3d-shadow{position:absolute;left:16%;bottom:1%;width:68%;height:6%;border-radius:50%;
          background:radial-gradient(ellipse,rgba(120,40,10,.4),transparent 70%);
          transition:opacity .45s ease}
        .f3d-g:hover .f3d-shadow{opacity:.7}

        @media (prefers-reduced-motion:reduce){.f3d-in,.f3d-shadow{transition:none}}
      `}</style>

      <div className="f3d-in">
        <div className="f3d-halo" />
        <div className="f3d-layer f3d-outer" />
        <div className="f3d-layer f3d-mid" />
        <div className="f3d-layer f3d-core" />
        <div className="f3d-sheen" />
        <div className="f3d-shadow" />
      </div>
    </div>
  );
}
