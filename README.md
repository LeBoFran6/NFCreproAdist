# NFCreproAdistance

Redirection NFC pilotée depuis GitHub Pages : la puce contient une URL fixe, et c'est un fichier `config.json` qui décide où le visiteur atterrit. On peut donc changer la destination autant de fois que voulu **sans réécrire la puce**.

```text
Puce NTAG215 (URL fixe, protégée par mot de passe)
        │
        ▼
https://lebofran6.github.io/NFCreproAdistance/
        │  lit config.json à chaque scan (cache-buster)
        ▼
https://example.com   ← la destination se change ici
```

> [!IMPORTANT]
> Le pseudo GitHub et le nom du dépôt font partie de l'URL inscrite sur la puce. Ce sont les seules choses vraiment définitives : choisis-les **avant** de graver tes puces. Si tu renommes le dépôt ou ton compte GitHub plus tard, il faudra réécrire les puces.

## État actuel

| Élément | Valeur |
|---|---|
| URL à inscrire sur la puce | `https://lebofran6.github.io/NFCreproAdistance/` |
| Destination actuelle | `https://example.com` (provisoire, à remplacer) |
| Protection de la puce | mot de passe NTAG21x — voir [GUIDE-PUCE-NTAG215.md](GUIDE-PUCE-NTAG215.md) |
| Aperçu de la config | ajouter `?preview=1` à l'URL |

## 1. Publier le site sur GitHub Pages

### Option A — depuis le site GitHub (le plus simple)

1. Crée un dépôt **public** nommé exactement `NFCreproAdistance` sur ton compte `lebofran6`.
2. Envoie tous les fichiers du dossier dans le dépôt (bouton **Add file → Upload files**, ou glisser-déposer). Le fichier `.nojekyll` est optionnel à l'upload web : son absence ne bloque pas ce site.
3. Va dans **Settings → Pages**.
4. Dans **Build and deployment**, choisis **Source : Deploy from a branch**.
5. Sélectionne la branche **main** et le dossier **/ (root)**, puis **Save**.
6. Attends 1 à 2 minutes, puis ouvre `https://lebofran6.github.io/NFCreproAdistance/`.

### Option B — en ligne de commande

Le dossier livré contient déjà un dépôt Git local avec un premier commit. Si tu repars d'une archive ZIP, initialise-le d'abord :

```powershell
cd C:\Users\Fran6\Desktop\NFCreproAdistance
git init
git add .
git commit -m "Site de redirection NFC"
git branch -M main
```

Puis crée le dépôt vide sur GitHub et relie-le :

```powershell
git remote add origin https://github.com/lebofran6/NFCreproAdistance.git
git push -u origin main
```

Si un remote `origin` existe déjà :

```powershell
git remote set-url origin https://github.com/lebofran6/NFCreproAdistance.git
git push -u origin main
```

Termine ensuite par l'activation de Pages dans **Settings → Pages** comme à l'option A.

> Le dépôt doit rester public : GitHub Pages gratuit pour un dépôt privé n'est pas disponible sur tous les comptes.

## 2. Changer la destination (sans toucher à la puce)

1. Ouvre directement [`config.json`](https://github.com/lebofran6/NFCreproAdistance/edit/main/config.json) (ou, depuis l'application GitHub mobile : dépôt → `config.json` → crayon).
2. Remplace la valeur de `url` par ta nouvelle adresse, en gardant les guillemets :

   ```json
   {
     "url": "https://mon-nouveau-lien.fr",
     "enabled": true,
     "forwardQuery": false,
     "updatedAt": "2026-10-26T12:00:00Z"
   }
   ```

3. Clique sur **Commit changes**.
4. Vérifie avec `https://lebofran6.github.io/NFCreproAdistance/?preview=1`.

C'est tout : **aucune puce à réencoder, aucun déploiement manuel**. GitHub Pages republie le fichier, puis la page le lit à chaque scan avec un cache-buster. Compte généralement moins d'une minute, parfois quelques minutes selon le cache de GitHub Pages.

### Les champs de `config.json`

| Champ | Type | Rôle |
|---|---|---|
| `url` | texte | Destination finale. Doit commencer par `https://` (ou `http://`). |
| `enabled` | booléen | `false` coupe la redirection et affiche « Redirection momentanément désactivée ». |
| `forwardQuery` | booléen | `true` transmet les paramètres du scan à la destination (ex. `?source=nfc`). `?preview=1` n'est jamais transmis. |
| `updatedAt` | texte | Date ISO informative, affichée dans l'aperçu. |
| `_aide` | texte | Ignoré par le site, sert de rappel. |

Règles JSON : des guillemets doubles, une virgule entre les champs, pas de commentaire, pas de virgule finale. En cas de doute :

```powershell
npm run check
```

Si `config.json` est illisible ou contient une URL invalide, la page utilise le lien de secours codé dans `index.html` (`FALLBACK_URL`, ainsi que le lien `<noscript>`). Ce filet de sécurité ne sert qu'en cas de panne : la vraie destination est bien celle de `config.json`. **Après avoir choisi ta destination définitive, mets aussi ces deux liens de secours à jour** pour qu'une panne n'envoie pas les visiteurs vers `example.com`.

### Désactiver temporairement le lien

Mets `"enabled": false` et commit. Les visiteurs verront une page neutre au lieu d'être redirigés. Remets `true` pour réactiver.

## 3. Aperçu et test local

L'aperçu affiche la destination, l'état de la redirection et un bouton pour tester le lien :

```text
https://lebofran6.github.io/NFCreproAdistance/?preview=1
```

> N'inscris **jamais** `?preview=1` sur la puce : le scan afficherait l'aperçu au lieu de rediriger. L'URL de la puce doit rester l'URL nue, avec le `/` final.

En local, sans dépendance à installer (Node.js 18+) :

```powershell
cd C:\Users\Fran6\Desktop\NFCreproAdistance
npm start
```

Puis ouvre :

- `http://localhost:8080/` pour tester la redirection ;
- `http://localhost:8080/?preview=1` pour l'aperçu.

Pour vérifier la config avant un commit :

```powershell
npm run check
```

Si le port 8080 est occupé :

```powershell
$env:PORT=8081; npm start
```

## 4. Encoder et protéger la puce

### Checklist avant de graver

- [ ] `config.json` pointe vers ta destination définitive.
- [ ] `FALLBACK_URL` et le lien `<noscript>` de `index.html` pointent aussi vers cette destination.
- [ ] `npm run check` passe sans erreur.
- [ ] L'URL GitHub Pages fonctionne, et `?preview=1` affiche la bonne destination.
- [ ] Le nom du dépôt et le pseudo GitHub sont définitifs.
- [ ] Tu as une puce de rechange pour tester.

Procédure détaillée : **[GUIDE-PUCE-NTAG215.md](GUIDE-PUCE-NTAG215.md)**.

En résumé :

1. Écris d'abord l'URL `https://lebofran6.github.io/NFCreproAdistance/` sur la puce (NFC Tools sur Android).
2. Relis la puce pour vérifier l'URL et le type (NTAG215).
3. Active ensuite la protection par mot de passe (NFC Tools Pro → protection NTAG21x) : mot de passe de 4 octets + PACK de 2 octets, `AUTH0 = 4`, bit `PROT = 1`.
4. Conserve le mot de passe et le PACK dans un gestionnaire de mots de passe — **jamais dans ce dépôt public**.
5. Teste : une écriture sans mot de passe doit échouer.

> La protection par mot de passe empêche la réécriture, pas la lecture. Elle n'est pas un chiffrement : le contenu de la puce reste lisible par n'importe quel téléphone.

## 5. Fichiers du projet

| Fichier | Rôle |
|---|---|
| `index.html` | Page de redirection, aperçu, styles et logique. |
| `config.json` | La destination et les options. **C'est le seul fichier à modifier au quotidien.** |
| `scripts/serve.mjs` | Petit serveur local pour tester (`npm start`). |
| `scripts/validate.mjs` | Vérifie `config.json` (`npm run check`). |
| `GUIDE-PUCE-NTAG215.md` | Écriture et protection par mot de passe de la puce. |
| `robots.txt` | Demande aux moteurs de recherche de ne pas indexer le site. |
| `.nojekyll` | Désactive le traitement Jekyll de GitHub Pages. |

## 6. Sécurité et limites

- **Le dépôt et `config.json` sont publics.** N'importe qui connaissant l'URL peut voir la destination. N'y mets aucun secret.
- **Le compte GitHub est le vrai panneau de contrôle.** Active l'authentification à deux facteurs et garde un mot de passe fort : si le compte est compromis, la destination peut être changée.
- **Le mot de passe de la puce est une dissuasion, pas une sécurité forte.** Le PWD fait 32 bits, il est envoyé en clair lors de l'authentification NFC et peut être bruteforcé ou écouté par un attaquant équipé. Il empêche surtout le curieux de réécrire la puce.
- **La lecture reste libre.** Le site ne vérifie pas l'UID de la puce : une copie de l'URL fonctionne, et une copie de la puce aussi. La protection empêche seulement de modifier l'original.
- **L'URL de la puce est définitive.** Changer de pseudo GitHub, renommer le dépôt ou changer de domaine cassera le lien inscrit sur les puces.
- Le site est servi en HTTPS par GitHub Pages, avec `noindex`, `robots.txt` et une CSP restrictive.
- Pour un lien réellement secret ou authentifié, il faut un service avec backend (Cloudflare Worker, Netlify Function, etc.) : ce projet statique ne le fait pas.

## 7. Dépannage

| Problème | Piste |
|---|---|
| 404 après activation de Pages | Attends 1-2 min ; vérifie branche `main`, dossier `/ (root)`, nom exact du dépôt. |
| Ancienne destination après un commit | Vérifie le commit, ouvre `?preview=1`, attends le redéploiement/cache GitHub Pages (jusqu'à ~10 min). |
| « Redirection momentanément désactivée » | `enabled` vaut `false` dans `config.json`. |
| « Destination indisponible » | `url` est vide, mal formée, ou ne commence pas par `http(s)://`. |
| La puce ne se détecte pas | NFC activé, puce contre l'antenne du téléphone (souvent en haut au dos), retire la coque, essaie une autre puce. |
| Écriture refusée sur la puce | Protection par mot de passe active : authentifie-toi avec le PWD. Si la puce est verrouillée définitivement, elle est en lecture seule. |
| Mot de passe refusé | 8 chiffres hexadécimaux pour le PWD (4 octets), 4 pour le PACK (2 octets) ; attention aux majuscules et au clavier. |
| L'aperçu s'affiche sur le téléphone | L'URL inscrite contient `?preview=1` : réécris l'URL nue. |
| Le téléphone n'ouvre rien | Le tag contient peut-être un enregistrement texte au lieu d'une URL : réécris un enregistrement URL/URI. |
| Le lien est cassé après renommage GitHub | Il faut réécrire les puces avec la nouvelle URL. |

## 8. Personnalisation

- Couleurs, spinner, textes : dans le `<style>` et le HTML de `index.html`.
- Le titre de l'onglet et le favicon sont aussi dans `index.html`.
- Si tu modifies `index.html`, la puce continue de fonctionner ; seul le cache de GitHub Pages peut retarder l'affichage (jusqu'à ~10 min). Les changements de `config.json` sont indépendants.
- Un domaine personnalisé (`go.tondomaine.fr`) est possible via un fichier `CNAME`, mais **change l'URL de la puce** : décide-le avant de graver.

---

Projet personnel. Tu peux l'utiliser et le modifier librement pour tes propres puces.
