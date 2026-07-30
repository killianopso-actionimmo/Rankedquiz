/**
 * Medaille 3D en CSS pur. Aucune animation continue.
 *
 * Le bombe vient d'un radial-gradient dont le centre est decale en haut a gauche
 * (source lumineuse) combine a une ombre interne en bas a droite : c'est ce
 * couple qui fait lire une surface convexe plutot qu'un disque plat.
 */
export function Badge3D({ className }: { className?: string }) {
  return (
    <div className={`b3d${className ? ` ${className}` : ""}`} aria-hidden>
      <style>{`
        .b3d{--b3d-d:100px;width:var(--b3d-d);height:calc(var(--b3d-d) * 1.28);position:relative;
          perspective:520px;flex:none}
        @media (max-width:640px){.b3d{--b3d-d:80px}}

        .b3d-in{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(8deg);
          transition:transform .45s cubic-bezier(.22,1,.36,1)}
        .b3d-g:hover .b3d-in{transform:rotateX(5deg) scale(1.045)}

        /* Rubans : passent derriere la medaille, encoche en V en bas. */
        /* Les bandes verticales simulent le pli du tissu : sans elles le ruban
           est un aplat rouge qui casse le rendu premium des deux autres pieces. */
        .b3d-ribbon{position:absolute;top:0;width:30%;height:42%;
          background:linear-gradient(100deg,#B8261B 0%,#FF3B30 18%,#FF7A4D 42%,#FF9933 58%,
            #F0522A 78%,#A81F16 100%);
          clip-path:polygon(0 0,100% 0,100% 78%,50% 100%,0 78%);
          box-shadow:0 3px 8px rgba(190,40,20,.32)}
        .b3d-ribbon-l{left:16%;transform:rotate(-13deg)}
        .b3d-ribbon-r{right:16%;transform:rotate(13deg);
          background:linear-gradient(80deg,#A81F16 0%,#E0301F 20%,#FF6A3A 44%,#FF8A22 60%,
            #D8401F 80%,#961B13 100%)}

        /* Cadre dore : conic-gradient = facettes metalliques sur le pourtour. */
        .b3d-ring{position:absolute;left:0;top:22%;width:100%;aspect-ratio:1;
          border-radius:50%;padding:7%;box-sizing:border-box;
          background:conic-gradient(from 210deg,#6E5211,#FFE066 12%,#C9A227 26%,#FFF6C2 42%,
            #C9A227 58%,#FFE066 72%,#7A5C14 88%,#6E5211);
          box-shadow:0 10px 20px rgba(0,0,0,.26),0 2px 4px rgba(0,0,0,.18)}

        /* Dome : lumiere en haut-gauche, ombre interne en bas-droite. */
        .b3d-dome{position:relative;width:100%;height:100%;border-radius:50%;
          background:radial-gradient(circle at 32% 26%,#C9FFFF 0%,#00FFFF 26%,#00B4F0 58%,#0568B4 82%,#03436F 100%);
          box-shadow:inset -6px -8px 16px rgba(2,40,70,.55),inset 5px 6px 14px rgba(255,255,255,.35)}
        /* Reflet specualire net, sinon la surface parait mate. */
        .b3d-dome::after{content:"";position:absolute;left:20%;top:14%;width:32%;height:24%;
          border-radius:50%;background:linear-gradient(150deg,rgba(255,255,255,.85),transparent 70%);
          filter:blur(2px)}

        .b3d-star{position:absolute;left:50%;top:50%;width:34%;height:34%;transform:translate(-50%,-50%);
          background:linear-gradient(160deg,#FFF6C2,#FFD700 45%,#C9A227);
          clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
          filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}

        .b3d-shadow{position:absolute;left:14%;bottom:0;width:72%;height:5%;border-radius:50%;
          background:radial-gradient(ellipse,rgba(0,0,0,.34),transparent 70%);
          transition:opacity .45s ease}
        .b3d-g:hover .b3d-shadow{opacity:.7}

        @media (prefers-reduced-motion:reduce){.b3d-in,.b3d-shadow{transition:none}}
      `}</style>

      <div className="b3d-in">
        <div className="b3d-ribbon b3d-ribbon-l" />
        <div className="b3d-ribbon b3d-ribbon-r" />
        <div className="b3d-ring">
          <div className="b3d-dome">
            <div className="b3d-star" />
          </div>
        </div>
        <div className="b3d-shadow" />
      </div>
    </div>
  );
}
