import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const B  = '#1a3a8a';
const BM = '#2952cc';
const G  = '#c9a227';
const GL = '#f0d060';
const BG = '#f0f4ff';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const PastorPage: React.FC = () => (
  <div className="min-h-screen" style={{ background: BG }}>
    <PublicNavbar />

    {/* ── Hero avec photo pasteur ── */}
    <section className="relative overflow-hidden pt-24 pb-16"
      style={{ background: `linear-gradient(150deg,${B} 0%,${BM} 60%,#3b6fd4 100%)` }}>

      {/* Cercles déco */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10 bg-white" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10" style={{ background: G }} />

      <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center gap-10">

        {/* Photo */}
        <motion.div {...fade(0)} className="flex-shrink-0">
          <div className="relative">
            {/* Rings */}
            <motion.div className="absolute inset-0 rounded-full border-4 opacity-30"
              style={{ borderColor: GL, margin: -8 }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }} />
            <motion.div className="absolute inset-0 rounded-full border-2 opacity-15"
              style={{ borderColor: 'white', margin: -18 }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} />

            <img src="/pastor.jpg" alt="Pasteur"
              className="w-52 h-52 md:w-64 md:h-64 rounded-full object-cover shadow-2xl border-4"
              style={{ borderColor: GL }} />

            {/* Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-black shadow-lg"
              style={{ background: G, color: B }}>
              ✝ Pasteur Principal
            </div>
          </div>
        </motion.div>

        {/* Identité */}
        <motion.div {...fade(0.15)} className="text-center md:text-left">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: GL }}>
            Message du Pasteur
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
            Église Évangélique des<br />
            <span style={{ color: GL }}>Assemblées de Dieu du Bénin</span>
          </h1>
          <p className="text-white/60 text-sm max-w-md">
            Temple Universitaire Godomey-Togoudo · Cotonou, Bénin
          </p>
        </motion.div>
      </div>
    </section>

    {/* ── Message principal ── */}
    <section className="py-14 max-w-4xl mx-auto px-5 space-y-10">

      {/* Bloc 1 — Aux fidèles */}
      <motion.div {...fade(0)}
        className="rounded-3xl p-8 flex flex-col gap-4"
        style={{ background: '#fff', boxShadow: '0 4px 30px rgba(26,58,138,.07)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
            <Heart size={18} className="text-white" />
          </div>
          <h2 className="font-black text-lg" style={{ color: B }}>À nos bien-aimés fidèles</h2>
        </div>
        <p className="text-gray-600 leading-loose text-sm">
          Bien-aimés frères et sœurs en Christ,<br /><br />
          C'est avec un cœur débordant de gratitude envers notre Seigneur et Sauveur Jésus-Christ
          que je vous adresse ce message. Vous êtes la raison pour laquelle nous prions, nous servons
          et nous persévérons. Chacun de vous est une pierre précieuse dans l'édifice que Dieu bâtit
          ici au Temple Universitaire.<br /><br />
          Continuez à vous ancrer dans la Parole de Dieu, à prier sans cesse, et à vous soutenir
          mutuellement avec amour. L'Église n'est pas seulement un lieu où l'on vient le dimanche —
          c'est une famille, votre famille. Ensemble, nous sommes plus forts, car là où deux ou trois
          sont réunis en son nom, Jésus est au milieu d'eux.<br /><br />
          <em className="font-semibold" style={{ color: B }}>
            "Supportez-vous les uns les autres, et pardonnez-vous réciproquement,
            si l'un a sujet de se plaindre de l'autre." — Colossiens 3:13
          </em>
        </p>
      </motion.div>

      {/* Bloc 2 — Au Corps de Christ */}
      <motion.div {...fade(0.1)}
        className="rounded-3xl p-8 flex flex-col gap-4"
        style={{ background: `linear-gradient(135deg,${B},${BM})` }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20">
            <BookOpen size={18} className="text-white" />
          </div>
          <h2 className="font-black text-lg text-white">Au Corps de Christ</h2>
        </div>
        <p className="text-white/85 leading-loose text-sm">
          À toutes les églises sœurs, aux pasteurs, évangélistes, prophètes et docteurs qui portent
          la vision de l'Évangile dans ce pays et au-delà — nous sommes un seul corps, une seule foi,
          un seul baptême.<br /><br />
          Notre mission ne s'arrête pas aux murs de nos temples. Elle s'étend jusqu'aux extrémités
          de la terre, dans les universités, les marchés, les foyers et les cœurs brisés. Que nos
          différences dénominationnelles ne soient jamais un obstacle à l'amour fraternel et à la
          proclamation de la vérité.<br /><br />
          Ensemble, avançons pour que la gloire de Dieu couvre la terre comme les eaux couvrent la mer.
        </p>
        <p className="text-right" style={{ color: GL }}>
          <em className="text-sm font-semibold">
            "Il n'y a qu'un seul corps et un seul Esprit." — Éphésiens 4:4
          </em>
        </p>
      </motion.div>

      {/* Bloc 3 — Appel au Salut */}
      <motion.div {...fade(0.2)}
        className="rounded-3xl p-8 flex flex-col gap-5 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${G},#e8b830)` }}>
        <div className="absolute right-6 top-6 opacity-[.07]">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <rect x="35" y="5" width="10" height="70" fill="white" />
            <rect x="10" y="25" width="60" height="10" fill="white" />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/30">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <h2 className="font-black text-lg text-white">Appel au Salut</h2>
        </div>

        <p className="text-white leading-loose text-sm">
          À vous qui lisez ces lignes aujourd'hui et qui cherchez la paix, le sens, ou la délivrance
          de vos fardeaux — Dieu vous connaît par votre nom. Il vous a créé avec amour, et il vous
          aime d'un amour éternel qui ne faiblit jamais.<br /><br />
          Vous n'avez pas besoin de vous améliorer avant de venir à lui. Venez tel que vous êtes,
          avec vos doutes, vos blessures, vos erreurs. Jésus-Christ est mort à la croix pour payer
          le prix de tous vos péchés, et il est ressuscité le troisième jour pour vous offrir une
          vie nouvelle — maintenant et pour l'éternité.<br /><br />
          <strong>Faites cette prière sincère aujourd'hui :</strong><br />
          <em>
            "Seigneur Jésus, je reconnais que je suis pécheur. Je crois que tu es mort pour moi et
            que tu es ressuscité. Je te demande de me pardonner et d'entrer dans ma vie comme
            Seigneur et Sauveur. Je te donne ma vie aujourd'hui. Amen."
          </em>
        </p>

        <div className="pt-2 border-t border-white/30">
          <p className="text-white font-bold text-sm">
            Si vous avez prié cette prière, contactez-nous — nous serons heureux de vous accompagner
            dans vos premiers pas de foi.
          </p>
        </div>
      </motion.div>

      {/* Verset final */}
      <motion.div {...fade(0.3)} className="text-center py-4">
        <motion.p className="text-lg font-black italic" style={{ color: B }}
          animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }}>
          "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit
          en lui ne périsse point, mais qu'il ait la vie éternelle."
        </motion.p>
        <p className="mt-2 text-sm font-bold" style={{ color: G }}>— Jean 3:16</p>
      </motion.div>
    </section>

    <PublicFooter />
  </div>
);

export default PastorPage;
