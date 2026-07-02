import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, BookOpen, Tv2, Heart } from 'lucide-react';
import logo from '../assets/images/logo_eglise.jpeg';

const B  = '#1a3a8a';
const GL = '#f0d060';

const PublicFooter: React.FC = () => (
  <footer id="contact" style={{ background: B }}>
    <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

      {/* Identité */}
      <div className="md:col-span-1">
        <img src={logo} alt="EEAD-TU"
          className="w-12 h-12 rounded-full object-cover border-2 mb-3"
          style={{ borderColor: GL }} />
        <h3 className="font-black text-white text-xs leading-snug mb-1">
          Eglise Évangélique des<br />Assemblées de Dieu du Bénin
        </h3>
        <p className="text-white/35 text-[10px] mt-1">Temple Universitaire · Cotonou</p>
        <p className="text-white/25 text-[9px] mt-2 italic">"Tout l'Évangile à toute la ville"</p>
      </div>

      {/* Contact */}
      <div>
        <h4 className="font-black text-[10px] uppercase tracking-widest mb-4" style={{ color: GL }}>
          Contact
        </h4>
        <div className="space-y-2.5">
          {[
            { icon: <MapPin size={11} />,  text: 'Godomey-Togoudo, Cotonou, Bénin' },
            { icon: <Phone size={11} />,   text: '+229 00 00 00 00' },
            { icon: <Mail size={11} />,    text: 'contact@eead-tu.org' },
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-white/55 text-[11px]">
              <span className="flex-shrink-0 mt-0.5" style={{ color: GL }}>{c.icon}</span>
              {c.text}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div>
        <h4 className="font-black text-[10px] uppercase tracking-widest mb-4" style={{ color: GL }}>
          Navigation
        </h4>
        <div className="space-y-2">
          {[
            { to: '/home',            label: 'Accueil' },
            { to: '/direct',          label: 'Culte en direct' },
            { to: '/home#emission',   label: 'Émission' },
            { to: '/home#actualites', label: 'Actualités' },
            { to: '/dons',            label: 'Dons & Offrandes' },
            { to: '/contact',         label: 'Pasteur & Contact' },
          ].map((l, i) => (
            <Link key={i} to={l.to}
              className="block text-[11px] text-white/45 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Rubriques */}
      <div>
        <h4 className="font-black text-[10px] uppercase tracking-widest mb-4" style={{ color: GL }}>
          Rubriques
        </h4>
        <div className="space-y-2">
          {[
            { to: '/versets',         icon: <BookOpen size={10} />, label: 'Versets & Messages' },
            { to: '/home#emission',   icon: <Tv2 size={10} />,     label: 'Émissions' },
            { to: '/appel-au-salut',  icon: <Heart size={10} />,   label: 'Donner ma vie à Jésus' },
            { to: '/login',           icon: null,                   label: 'Espace membre' },
          ].map((l, i) => (
            <Link key={i} to={l.to}
              className="flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white transition-colors">
              {l.icon && <span style={{ color: GL }}>{l.icon}</span>}
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>

    {/* Barre bas */}
    <div className="border-t border-white/10 py-4">
      <p className="text-center text-white/20 text-[10px]">
        © {new Date().getFullYear()} EEAD-TU · Tous droits réservés
      </p>
    </div>
  </footer>
);

export default PublicFooter;
