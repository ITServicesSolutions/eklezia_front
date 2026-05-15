import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlatforms, updatePlatformConfig, type PublicationPlatform } from '../api/videos';
import {
  Plus, Trash2, ListTree, Settings, ShieldCheck, HelpCircle, Activity, Eye, EyeOff,
} from 'lucide-react';

const PlatformsSettings: React.FC = () => {
  const [platform, setPlatform] = useState<PublicationPlatform | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');
  const [credentials, setCredentials] = useState<{ id: string; key: string; value: string }[]>([]);
  const [publishFields, setPublishFields] = useState<{
    id: string; name: string; label: string; type: string; target_type?: string;
  }[]>([]);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  const toggleSecretVisibility = (id: string) => {
    const next = new Set(visibleSecrets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleSecrets(next);
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await fetchPlatforms();
      if (p.length > 0) {
        const unified = p[0];
        setPlatform(unified);
        const conf = unified.config || {};
        const credsObj = conf.credentials || {};
        const fieldsArr = conf.fields || [];
        setCredentials(
          Object.keys(credsObj).map(k => ({
            id: Math.random().toString(36).substr(2, 9),
            key: k,
            value: credsObj[k],
          }))
        );
        setPublishFields(
          fieldsArr.map((f: any) => ({ ...f, id: Math.random().toString(36).substr(2, 9) }))
        );
      }
    } catch {
      Swal.fire('Erreur', 'Impossible de charger la configuration globale', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!platform) return;
    try {
      const credsObj: Record<string, string> = {};
      credentials.forEach(c => {
        if (c.key.trim()) credsObj[c.key.trim()] = c.value.trim();
      });
      const validFields = publishFields
        .filter(f => f.name.trim() && f.label.trim())
        .map(f => ({
          name: f.name.trim(),
          label: f.label.trim(),
          type: f.type || 'text',
          target_type: f.target_type || 'ALL',
        }));
      const newConfig = {
        credentials: Object.keys(credsObj).length > 0 ? credsObj : undefined,
        fields: validFields.length > 0 ? validFields : undefined,
      };
      await updatePlatformConfig(platform.id, newConfig);
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
        .fire({ icon: 'success', title: 'Configuration sauvegardée !' });
      setPlatform({ ...platform, config: newConfig });
    } catch {
      Swal.fire('Erreur de Sauvegarde', "Une erreur est survenue lors de l'enregistrement.", 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-neo-bg min-h-screen flex items-center justify-center">
        <div className="neo-circle w-16 h-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neo-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="bg-neo-bg min-h-screen flex items-center justify-center p-8">
        <div className="neo-card p-10 max-w-md text-center">
          <Settings size={40} className="mx-auto mb-4 text-neo-text-secondary" />
          <p className="text-neo-text-secondary">
            Aucune plateforme configurée dans la base de données.
            Veuillez exécuter le seed du système.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neo-bg min-h-screen p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="neo-circle w-12 h-12 flex items-center justify-center">
              <Activity size={22} className="text-neo-primary" />
            </div>
            <h1 className="text-2xl font-bold text-neo-text">Configuration Vidéo</h1>
          </div>
          <p className="text-neo-text-secondary text-sm ml-15 pl-1">
            Configurez l'interface globale qui permet d'attacher n'importe quel flux vidéo à une session.
          </p>
        </motion.div>

        {/* Tabs néo */}
        <div className="flex gap-3 mb-6">
          {([
            { key: 'config', label: 'Paramètres', icon: <Settings size={16} /> },
            { key: 'guide',  label: 'Guide',       icon: <HelpCircle size={16} /> },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border-0 ${
                activeTab === tab.key
                  ? 'bg-neo-primary text-white'
                  : 'text-neo-text-secondary hover:opacity-80'
              }`}
              style={
                activeTab === tab.key
                  ? { boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff' }
                  : { boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff', background: '#e8ecef' }
              }
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des tabs */}
        <AnimatePresence mode="wait">
          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="neo-card p-6 space-y-8"
            >
              {/* Banner — Enregistrer */}
              <div className="neo-inset p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-neo-text text-lg">Base de diffusion commune</h2>
                  <p className="text-sm text-neo-text-secondary mt-1 max-w-xl">
                    Ce formulaire universel s'affichera chaque fois que vous "publiez" une vidéo ou un direct.
                  </p>
                </div>
                <button onClick={handleSave} className="neo-btn-primary flex-shrink-0">
                  Enregistrer
                </button>
              </div>

              {/* Section — Champs de diffusion */}
              <section className="neo-card-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="neo-circle w-9 h-9 flex items-center justify-center">
                      <ListTree size={16} className="text-neo-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neo-text">Champs de diffusion</h3>
                      <p className="text-xs text-neo-text-secondary">
                        Quelles infos demandez-vous lors d'une publication ?
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setPublishFields([
                        ...publishFields,
                        { id: Math.random().toString(36), name: '', label: '', type: 'text' },
                      ])
                    }
                    className="neo-btn-ghost text-sm"
                  >
                    <Plus size={15} />
                    Ajouter
                  </button>
                </div>

                {publishFields.length === 0 ? (
                  <div className="neo-inset p-8 text-center border-2 border-dashed border-transparent rounded-xl">
                    <p className="text-neo-text-secondary text-sm italic">
                      Aucun champ configuré. Cliquez sur "Ajouter".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {publishFields.map((field, index) => (
                      <div key={field.id} className="neo-inset p-4">
                        <div className="flex gap-4 mb-3">
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-neo-text-secondary uppercase tracking-wider block mb-1">
                              Texte affiché
                            </label>
                            <input
                              type="text"
                              placeholder="ex: Lien URL de la vidéo"
                              className="neo-input"
                              value={field.label}
                              onChange={e => {
                                const f = [...publishFields];
                                f[index].label = e.target.value;
                                setPublishFields(f);
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-neo-text-secondary uppercase tracking-wider block mb-1">
                              Code Interne (ID)
                            </label>
                            <input
                              type="text"
                              placeholder="ex: video_url"
                              className="neo-input font-mono"
                              value={field.name}
                              onChange={e => {
                                const f = [...publishFields];
                                f[index].name = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9_]/g, '');
                                setPublishFields(f);
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-neo-text-secondary uppercase tracking-wider block mb-1">
                              Type d'entrée
                            </label>
                            <select
                              className="neo-input"
                              value={field.type}
                              onChange={e => {
                                const f = [...publishFields];
                                f[index].type = e.target.value;
                                setPublishFields(f);
                              }}
                            >
                              <option value="text">Texte Court (Clé OBS, IDs)</option>
                              <option value="url">Lien URL complet (VOD, iframe)</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-neo-text-secondary uppercase tracking-wider block mb-1">
                              Contenu concerné
                            </label>
                            <select
                              className="neo-input"
                              value={field.target_type || 'ALL'}
                              onChange={e => {
                                const f = [...publishFields];
                                f[index].target_type = e.target.value;
                                setPublishFields(f);
                              }}
                            >
                              <option value="ALL">Tous les types</option>
                              <option value="VOD">VOD uniquement</option>
                              <option value="LIVE">LIVE uniquement</option>
                              <option value="EXTERNAL">EXTERNAL uniquement</option>
                            </select>
                          </div>
                          <button
                            onClick={() =>
                              setPublishFields(publishFields.filter(f => f.id !== field.id))
                            }
                            className="neo-icon-btn text-neo-text-secondary hover:text-neo-error flex-shrink-0"
                            style={{ color: undefined }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section — Variables secrètes */}
              <section className="neo-card-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="neo-circle w-9 h-9 flex items-center justify-center">
                      <ShieldCheck size={16} className="text-neo-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neo-text">Variables secrètes</h3>
                      <p className="text-xs text-neo-text-secondary">
                        Variables système (ex: Hôte RTMP, JWT token interne).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setCredentials([
                        ...credentials,
                        { id: Math.random().toString(36), key: '', value: '' },
                      ])
                    }
                    className="neo-btn-ghost text-sm"
                  >
                    <Plus size={15} />
                    Ajouter
                  </button>
                </div>

                {credentials.length === 0 ? (
                  <div className="neo-inset p-6 text-center rounded-xl">
                    <p className="text-neo-text-secondary text-sm italic">
                      Aucun secret global configuré.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {credentials.map((cred, index) => (
                      <div key={cred.id} className="flex gap-3 items-center">
                        <div className="w-1/3">
                          <input
                            type="text"
                            placeholder="Clé (ex: RTMP_HOST)"
                            className="neo-input font-mono text-sm"
                            value={cred.key}
                            onChange={e => {
                              const c = [...credentials];
                              c[index].key = e.target.value;
                              setCredentials(c);
                            }}
                          />
                        </div>
                        <div className="flex-1 relative">
                          <input
                            type={visibleSecrets.has(cred.id) ? 'text' : 'password'}
                            placeholder="Valeur secrète..."
                            className="neo-input font-mono text-sm pr-10"
                            value={cred.value}
                            onChange={e => {
                              const c = [...credentials];
                              c[index].value = e.target.value;
                              setCredentials(c);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(cred.id)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neo-text-secondary hover:text-neo-primary transition-colors"
                          >
                            {visibleSecrets.has(cred.id)
                              ? <EyeOff size={15} />
                              : <Eye size={15} />}
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            setCredentials(credentials.filter(c => c.id !== cred.id))
                          }
                          className="neo-icon-btn text-neo-text-secondary hover:text-neo-error flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="neo-card p-6 space-y-6 max-w-3xl"
            >
              {/* Concept */}
              <div className="neo-inset p-5">
                <div className="flex items-center gap-3 mb-3">
                  <HelpCircle size={22} className="text-neo-primary flex-shrink-0" />
                  <h2 className="text-lg font-bold text-neo-text">
                    Le Concept de "Configuration Unifiée"
                  </h2>
                </div>
                <p className="text-neo-text-secondary text-sm leading-relaxed">
                  Eklezia utilise une approche globale simplifiée. Plutôt que de configurer YouTube,
                  Facebook, et OBS séparément, vous définissez ici{' '}
                  <strong className="text-neo-text">un seul formulaire</strong> qui sera utilisé
                  pour <strong className="text-neo-text">toutes</strong> vos publications vidéo.
                </p>
              </div>

              {/* Exemple recommandé */}
              <div className="neo-card-sm p-5">
                <h3 className="font-bold text-neo-text mb-3">Exemple de configuration recommandée</h3>
                <p className="text-sm text-neo-text-secondary mb-4">
                  Pour accueillir n'importe quel type de vidéo, ajoutez ces deux "Champs requis" :
                </p>
                <div className="space-y-3">
                  {[
                    {
                      num: '1',
                      title: 'Lien URL Externe (VOD / YouTube / Iframe)',
                      meta: 'video_url • Type: Lien URL',
                      desc: "Utile pour poster le lien d'une vidéo YouTube ou d'un fichier .mp4.",
                      color: 'text-neo-primary',
                    },
                    {
                      num: '2',
                      title: 'Clé de Flux Sécurisée (Direct / OBS)',
                      meta: 'stream_key • Type: Texte Court',
                      desc: 'Utile pour les directs OBS — vos utilisateurs renseignent la clé rtmp de leur session.',
                      color: 'text-neo-error',
                    },
                  ].map(item => (
                    <div key={item.num} className="neo-inset p-4 flex items-start gap-4">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: '#e8ecef', boxShadow: '3px 3px 6px #c5ccd4, -3px -3px 6px #fff' }}
                      >
                        <span className={item.color}>{item.num}</span>
                      </span>
                      <div>
                        <p className="font-semibold text-neo-text text-sm">{item.title}</p>
                        <p className="text-neo-text-secondary text-xs mt-0.5 font-mono">
                          ID Code: {item.meta}
                        </p>
                        <p className="text-neo-text-secondary text-xs mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OBS RTMP */}
              <div className="neo-card-sm p-5">
                <h3 className="font-bold text-neo-text mb-3">Et pour OBS (RTMP) ?</h3>
                <p className="text-sm text-neo-text-secondary mb-3">
                  Si votre serveur héberge son propre récepteur RTMP, définissez son URL dans les
                  "Variables secrètes" :
                </p>
                <div className="neo-inset p-4">
                  <p className="text-xs font-mono text-neo-text">
                    Clé :{' '}
                    <span className="text-neo-primary font-semibold">RTMP_SERVER_URL</span>
                  </p>
                  <p className="text-xs font-mono text-neo-text-secondary mt-1">
                    Valeur :{' '}
                    <span className="text-neo-warning">rtmp://live.votre-serveur.com/app</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default PlatformsSettings;
