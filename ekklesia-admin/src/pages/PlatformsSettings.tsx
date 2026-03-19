import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { fetchPlatforms, updatePlatformConfig, type PublicationPlatform } from '../api/videos';
import { Plus, Trash2, ListTree, Settings, ShieldCheck, HelpCircle, Activity, Eye, EyeOff } from 'lucide-react';

const PlatformsSettings: React.FC = () => {
  const [platform, setPlatform] = useState<PublicationPlatform | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Onglets dans le panneau droit : 'config' ou 'guide'
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');

  // Dynamic Form States
  const [credentials, setCredentials] = useState<{id: string, key: string, value: string}[]>([]);
  const [publishFields, setPublishFields] = useState<{id: string, name: string, label: string, type: string, target_type?: string}[]>([]);
  
  // Track visibility of specific secrets
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  const toggleSecretVisibility = (id: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(id)) newVisible.delete(id);
    else newVisible.add(id);
    setVisibleSecrets(newVisible);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await fetchPlatforms();
      if (p.length > 0) {
        const unifiedPlatform = p[0];
        setPlatform(unifiedPlatform);
        
        // Charger et transformer la configuration sauvegardée
        const conf = unifiedPlatform.config || {};
        const credsObj = conf.credentials || {};
        const fieldsArr = conf.fields || [];

        setCredentials(Object.keys(credsObj).map(k => ({
          id: Math.random().toString(36).substr(2, 9),
          key: k,
          value: credsObj[k]
        })));

        setPublishFields(fieldsArr.map((f: any) => ({
          ...f,
          id: Math.random().toString(36).substr(2, 9)
        })));
      }
    } catch (error) {
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
        if (c.key.trim()) {
           credsObj[c.key.trim()] = c.value.trim();
        }
      });

      const validFields = publishFields.filter(f => f.name.trim() && f.label.trim()).map(f => ({
        name: f.name.trim(),
        label: f.label.trim(),
        type: f.type || 'text',
        target_type: f.target_type || 'ALL'
      }));

      const newConfig = {
        credentials: Object.keys(credsObj).length > 0 ? credsObj : undefined,
        fields: validFields.length > 0 ? validFields : undefined
      };

      await updatePlatformConfig(platform.id, newConfig);
      
      Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000})
          .fire({icon: 'success', title: 'Configuration sauvegardée !'});
      
      const updatedPlatform = { ...platform, config: newConfig };
      setPlatform(updatedPlatform);
    } catch (e) {
      Swal.fire('Erreur de Sauvegarde', 'Une erreur est survenue lors de l\'enregistrement de votre configuration.', 'error');
    }
  };

  if (loading) {
      return (
          <div className="max-w-4xl mx-auto p-6 mt-10">
              <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
              </div>
          </div>
      );
  }

  if (!platform) {
      return (
        <div className="max-w-4xl mx-auto p-6 mt-10 text-center text-gray-500">
            Aucune plateforme configurée dans la base de données. Veuillez exécuter le seed du système.
        </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Activity className="text-blue-600" /> Configuration Unifiée (Sources Vidéos)
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configurez ici l'interface globale qui permettra à vos administrateurs d'attacher n'importe quel flux vidéo (VOD YouTube, Serveur RTMP OBS, Vidéo externe) à une session Eklezia.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden flex flex-col min-h-0 flex-1 border dark:border-gray-700">
          
          {/* Tabs Header */}
          <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
              <button 
                onClick={() => setActiveTab('config')}
                className={`px-8 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'config' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 shadow-sm' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings size={18} /> Paramètres du Lecteur
              </button>
              <button 
                onClick={() => setActiveTab('guide')}
                className={`px-8 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'guide' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800 shadow-sm' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <HelpCircle size={18} /> Comment ça marche ?
              </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="p-8 overflow-y-auto flex-1 bg-white dark:bg-gray-800">
              {activeTab === 'config' && (
                  <div className="space-y-10 animate-in fade-in">
                      <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                          <div>
                             <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300">Base de diffusion commune</h2>
                             <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 max-w-2xl">
                                En configurant cette page unique, vous créez un formulaire universel qui s'affichera chaque fois que vous "publierez" une vidéo ou un direct.
                             </p>
                          </div>
                          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center gap-2 transform active:scale-95">
                              Enregistrer
                          </button>
                      </div>

                      {/* Champs Dynamiques */}
                      <section className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-4 border-b dark:border-gray-700 pb-4">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400"><ListTree size={20} /></div>
                                  <div>
                                      <h3 className="font-bold text-lg dark:text-gray-100">Champs requis pour la diffusion</h3>
                                      <p className="text-xs text-gray-500 mt-1">Quelles informations demandez-vous lors d'une publication ? (ex: Lien URL, Clé Stream OBS, ID Réunion)</p>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => setPublishFields([...publishFields, { id: Math.random().toString(36), name: '', label: '', type: 'text' }])}
                                  className="text-sm bg-white dark:bg-gray-800 border dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium"
                              >
                                  <Plus size={16} /> Ajouter un champ
                              </button>
                          </div>
                          
                          {publishFields.length === 0 ? (
                              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed dark:border-gray-700 text-sm text-gray-500 italic">
                                  Aucun champ configuré. Les administrateurs ne pourront fournir aucun lien. Cliquez sur "Ajouter".
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  {publishFields.map((field, index) => (
                                      <div key={field.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-600 shadow-sm relative group hover:border-emerald-300 transition-colors">
                                          <div className="flex gap-4 mb-4">
                                              <div className="flex-1">
                                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Texte affiché à l'écran</label>
                                                  <input 
                                                      type="text" placeholder="ex: Lien URL de la vidéo" 
                                                      className="w-full mt-2 p-3 text-sm border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                                      value={field.label} onChange={e => { const f = [...publishFields]; f[index].label = e.target.value; setPublishFields(f); }}
                                                  />
                                              </div>
                                              <div className="flex-1">
                                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Code Interne (ID)</label>
                                                  <input 
                                                      type="text" placeholder="ex: video_url" 
                                                      className="w-full mt-2 p-3 text-sm font-mono border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-emerald-500"
                                                      value={field.name} onChange={e => { const f = [...publishFields]; f[index].name = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''); setPublishFields(f); }}
                                                  />
                                              </div>
                                          </div>
                                          <div className="flex gap-4 items-end">
                                              <div className="flex-1">
                                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type d'entrée</label>
                                                  <select 
                                                      className="w-full mt-2 p-3 text-sm border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                                      value={field.type} onChange={e => { const f = [...publishFields]; f[index].type = e.target.value; setPublishFields(f); }}
                                                  >
                                                      <option value="text">Texte Court (Clé OBS, IDs)</option>
                                                      <option value="url">Lien URL complet (VOD, iframe)</option>
                                                  </select>
                                              </div>
                                              <div className="flex-1">
                                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type de contenu concerné</label>
                                                  <select 
                                                      className="w-full mt-2 p-3 text-sm border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold text-blue-600"
                                                      value={field.target_type || 'ALL'} onChange={e => { const f = [...publishFields]; f[index].target_type = e.target.value; setPublishFields(f); }}
                                                  >
                                                      <option value="ALL">Tous les types</option>
                                                      <option value="VOD">VOD uniquement</option>
                                                      <option value="LIVE">LIVE uniquement</option>
                                                      <option value="EXTERNAL">EXTERNAL uniquement</option>
                                                  </select>
                                              </div>
                                              <button onClick={() => setPublishFields(publishFields.filter(f => f.id !== field.id))} className="text-gray-300 hover:text-red-500 transition-colors p-3 bg-gray-50 hover:bg-red-50 dark:bg-gray-900 dark:hover:bg-red-900/30 rounded-lg border dark:border-gray-700">
                                                  <Trash2 size={20} />
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </section>

                      {/* Paramètres Privés */}
                      <section className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-4 border-b dark:border-gray-700 pb-4">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400"><ShieldCheck size={20} /></div>
                                  <div>
                                      <h3 className="font-bold text-lg dark:text-gray-100">Variables Globales du Serveur (Sécurité)</h3>
                                      <p className="text-xs text-gray-500 mt-1">Variables secrètes liées au système Eklezia (ex: Hôte RTMP, JWT token interne).</p>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => setCredentials([...credentials, { id: Math.random().toString(36), key: '', value: '' }])}
                                  className="text-sm bg-white dark:bg-gray-800 border dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium"
                              >
                                  <Plus size={16} /> Ajouter une clé
                              </button>
                          </div>
                          
                          {credentials.length === 0 ? (
                              <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed dark:border-gray-700 text-sm text-gray-500 italic">
                                  Aucun secret global configuré.
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  {credentials.map((cred, index) => (
                                      <div key={cred.id} className="flex gap-4 items-center animate-in slide-in-from-left-2 transition-all">
                                          <div className="w-1/3">
                                              <input 
                                                  type="text" placeholder="Clé (ex: RTMP_HOST)" 
                                                  className="w-full p-3 text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-amber-500 transition-shadow"
                                                  value={cred.key} onChange={e => { const c = [...credentials]; c[index].key = e.target.value; setCredentials(c); }}
                                              />
                                          </div>
                                          <div className="flex-1 relative group">
                                              <input 
                                                  type={visibleSecrets.has(cred.id) ? "text" : "password"} 
                                                  placeholder="Valeur secrète de la clé..." 
                                                  className="w-full p-3 pr-10 font-mono text-sm border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all"
                                                  value={cred.value} onChange={e => { const c = [...credentials]; c[index].value = e.target.value; setCredentials(c); }}
                                              />
                                              <button 
                                                  type="button"
                                                  onClick={() => toggleSecretVisibility(cred.id)}
                                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors"
                                                  title={visibleSecrets.has(cred.id) ? "Masquer" : "Afficher"}
                                              >
                                                  {visibleSecrets.has(cred.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                                              </button>
                                          </div>
                                          <button onClick={() => setCredentials(credentials.filter(c => c.id !== cred.id))} className="text-gray-300 hover:text-red-500 p-3 bg-white hover:bg-red-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700 transition-colors">
                                              <Trash2 size={20} />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </section>
                  </div>
              )}

              {activeTab === 'guide' && (
                  <div className="space-y-8 animate-in fade-in max-w-3xl mx-auto">
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-lg p-6">
                          <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-500 flex items-center gap-3">
                              <HelpCircle size={28} /> Le Concept de "Configuration Unifiée"
                          </h2>
                          <p className="mt-4 text-emerald-800 dark:text-emerald-400 text-sm leading-relaxed">
                              Eklezia utilise désormais une approche globale simplifiée. Plutôt que de configurer YouTube, Facebook, et OBS séparément, vous définissez ici <strong>un seul formulaire</strong> qui sera utilisé pour <strong>toutes</strong> vos publications vidéo.
                          </p>
                      </div>
                      
                      <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm">
                          
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Exemple de configuration recommandée</h3>
                              <p className="mb-4">Pour pouvoir accueillir n'importe quel type de vidéo en différé ou en direct, ajoutez simplement ces deux "Champs requis" dans l'onglet Paramètres :</p>
                              
                              <div className="space-y-3">
                                  <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                                      <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded">1</div>
                                      <div>
                                          <p className="font-bold">Lien URL Externe (VOD / YouTube / Iframe)</p>
                                          <p className="text-gray-500 text-xs mt-1">ID Code: <code>video_url</code> • Type: <code>Lien URL</code></p>
                                          <p className="mt-2 text-xs">Utile pour poster le lien direct d'une vidéo YouTube enregistrée ou d'un fichier .mp4 stocké en ligne.</p>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                                      <div className="bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded">2</div>
                                      <div>
                                          <p className="font-bold">Clé de Flux Sécurisée (Direct / OBS)</p>
                                          <p className="text-gray-500 text-xs mt-1">ID Code: <code>stream_key</code> • Type: <code>Texte Court</code></p>
                                          <p className="mt-2 text-xs">Utile si vous envoyez un direct vidéo depuis OBS Studio. Vos utilisateurs n'auront plus qu'à renseigner la clé rtmp unique de leur session.</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Et pour OBS (RTMP) ?</h3>
                              <p className="mb-2">Si votre Serveur Eklezia héberge son propre récepteur RTMP (ex: nginx-rtmp), définissez simplement son URL globale dans les "Variables de Sécurité" :</p>
                              <ul className="list-disc pl-5 space-y-2 mt-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                                  <li>Clé: <code>RTMP_SERVER_URL</code></li>
                                  <li className="font-mono text-amber-600 dark:text-amber-400">Valeur: rtmp://live.votre-serveur.com/app</li>
                              </ul>
                              <p className="mt-3 text-xs italic">De cette manière, le code source d'Eklezia saura comment construire le lecteur vidéo final pour vos internautes.</p>
                          </div>

                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default PlatformsSettings;
