/**
 * Trophee 3D en CSS pur. Aucune animation continue : la profondeur vient de
 * l'etagement des degrades (bandes metalliques), pas du mouvement.
 *
 * Le relief metallique repose sur un degrade a bandes serrees (sombre / clair /
 * sombre) : c'est ce qui distingue un or credible d'un aplat jaune.
 */
export function Trophy3D({ className }: { className?: string }) {
  return (
    <div className={`t3d${className ? ` ${className}` : ""}`} aria-hidden>
      <style>{`
        /* font-size = hauteur : permet des epaisseurs en em, donc proportionnelles
           a toutes les tailles (une bordure en px casse l'echelle). */
        .t3d{--t3d-h:120px;width:calc(var(--t3d-h) * .95);height:var(--t3d-h);position:relative;
          perspective:520px;flex:none;font-size:var(--t3d-h)}
        @media (max-width:640px){.t3d{--t3d-h:96px}}

        .t3d-in{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(9deg);
          transition:transform .45s cubic-bezier(.22,1,.36,1),filter .45s ease}
        .t3d-g:hover .t3d-in{transform:rotateX(6deg) scale(1.045)}

        /* Anses : elles doivent CHEVAUCHER la silhouette de la coupe, sinon elles
           lisent comme deux anneaux flottants et non comme des anses attachees.
           La coupe occupe 19%-81% ; les anses vont donc de 3% a 29% et 71% a 97%. */
        .t3d-handle{position:absolute;top:13%;width:26%;height:29%;
          border-radius:50%;box-shadow:inset 0 0 0 .042em #C9A227,inset -.012em -.012em 0 .042em rgba(110,82,17,.55);
          background:transparent}
        .t3d-handle-l{left:3%;transform:rotate(-14deg) rotateY(16deg)}
        .t3d-handle-r{right:3%;transform:rotate(14deg) rotateY(-16deg)}

        /* Coupe : bandes verticales = reflet metallique. Posee au-dessus des anses. */
        .t3d-cup{position:absolute;left:19%;top:8%;width:62%;height:40%;z-index:1;
          border-radius:8% 8% 46% 46% / 5% 5% 74% 74%;
          background:linear-gradient(100deg,#7A5C14 0%,#C9A227 14%,#FFD700 32%,#FFF6C2 46%,
            #FFD700 60%,#C9A227 80%,#6E5211 100%);
          box-shadow:0 6px 14px rgba(122,92,20,.32),inset 0 -6px 10px rgba(90,66,10,.45)}
        /* Reflet specualire haut-gauche. */
        .t3d-cup::after{content:"";position:absolute;left:16%;top:10%;width:22%;height:46%;
          border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.75),transparent);
          filter:blur(1.5px)}

        /* Bord superieur : ellipse couchee, donne l'ouverture de la coupe. */
        .t3d-rim{position:absolute;left:16%;top:4.5%;width:68%;height:12%;border-radius:50%;z-index:2;
          background:linear-gradient(100deg,#8A6A1A,#FFD700 30%,#FFF6C2 50%,#FFD700 72%,#7A5C14);
          box-shadow:0 2px 4px rgba(0,0,0,.25),inset 0 -2px 3px rgba(90,66,10,.5)}

        .t3d-stem{position:absolute;left:44.5%;top:47%;width:11%;height:15%;
          background:linear-gradient(100deg,#6E5211,#C9A227 30%,#FFE066 52%,#C9A227 72%,#5E4610);
          box-shadow:inset 0 0 4px rgba(0,0,0,.3)}

        /* Socle : deux gradins + une face superieure eclairee. */
        .t3d-base1{position:absolute;left:29%;top:62%;width:42%;height:9%;border-radius:2px;
          background:linear-gradient(100deg,#6E5211,#C9A227 28%,#FFE066 50%,#C9A227 74%,#5E4610)}
        .t3d-base2{position:absolute;left:17%;top:71%;width:66%;height:13%;border-radius:3px;
          background:linear-gradient(100deg,#5E4610,#B8931F 26%,#F0CE55 50%,#B8931F 76%,#4E3A0D);
          box-shadow:0 8px 16px rgba(0,0,0,.28)}
        /* Texture du socle : rainures fines, tres peu contrastees. */
        .t3d-base2::after{content:"";position:absolute;inset:0;border-radius:3px;
          background:repeating-linear-gradient(90deg,rgba(255,255,255,.16) 0 1px,transparent 1px 5px);
          opacity:.5}

        .t3d-shadow{position:absolute;left:12%;bottom:2%;width:76%;height:6%;border-radius:50%;
          background:radial-gradient(ellipse,rgba(0,0,0,.38),transparent 70%);
          transition:opacity .45s ease}
        .t3d-g:hover .t3d-shadow{opacity:.7}

        @media (prefers-reduced-motion:reduce){.t3d-in,.t3d-shadow{transition:none}}
      `}</style>

      <div className="t3d-in">
        <div className="t3d-handle t3d-handle-l" />
        <div className="t3d-handle t3d-handle-r" />
        <div className="t3d-cup" />
        <div className="t3d-rim" />
        <div className="t3d-stem" />
        <div className="t3d-base1" />
        <div className="t3d-base2" />
        <div className="t3d-shadow" />
      </div>
    </div>
  );
}
