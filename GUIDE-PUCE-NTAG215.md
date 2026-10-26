# Guide — encoder et protéger une puce NTAG215

Ce guide explique comment inscrire l'URL du site sur une puce NTAG215, puis empêcher sa réécriture par un mot de passe.

> [!WARNING]
> Ne note **jamais** le mot de passe (PWD) ni le PACK dans ce dépôt : il est public. Garde-les dans un gestionnaire de mots de passe.

## Ce qu'il te faut

- Une puce **NTAG215** (504 octets de mémoire utile : largement assez pour l'URL).
- Un téléphone **Android** avec l'application **NFC Tools** (gratuite pour écrire) et **NFC Tools Pro** (payante, pour la protection par mot de passe NTAG21x).
- L'URL finale : `https://lebofran6.github.io/NFCreproAdistance/`
- Un gestionnaire de mots de passe.
- Une puce de rechange, pour tester sans risque.

> Sur iPhone, la lecture fonctionne, mais l'écriture et surtout la protection par mot de passe se font en pratique sur Android.

## Étape 1 — Vérifier l'URL finale

1. Ouvre `https://lebofran6.github.io/NFCreproAdistance/` dans un navigateur : tu dois être redirigé vers la destination de `config.json`.
2. Ouvre `https://lebofran6.github.io/NFCreproAdistance/?preview=1` : tu dois voir l'aperçu et la destination.
3. L'URL à graver est **exactement** :

   ```text
   https://lebofran6.github.io/NFCreproAdistance/
   ```

   Avec `https://`, le nom exact du dépôt et le `/` final. **Sans** `?preview=1`.

> Si tu comptes renommer le dépôt, changer de pseudo GitHub ou utiliser un domaine personnalisé, fais-le **maintenant**. Après la gravure, l'URL de la puce est définitive.

## Étape 2 — Écrire l'URL sur la puce

1. Active le NFC sur le téléphone.
2. Ouvre **NFC Tools** → onglet **Écrire**.
3. **Ajouter un enregistrement** → **URL / URI**.
4. Colle `https://lebofran6.github.io/NFCreproAdistance/` → **OK**.
5. Touche **Écrire**, puis approche la puce de l'antenne NFC du téléphone (souvent en haut au dos). Bouge doucement jusqu'à la détection.
6. Attends la confirmation d'écriture.

Conseils :

- Ne pose qu'**une seule puce** sur la table pendant l'écriture, pour ne pas graver la mauvaise.
- Retire la coque du téléphone si la détection est capricieuse.
- Une coque ou un support métallique peut bloquer le NFC.

## Étape 3 — Relire et vérifier

1. Onglet **Lire** de NFC Tools.
2. Scanne la puce.
3. Vérifie :
   - le type : **NTAG215** ;
   - l'enregistrement : une **URL** (pas un texte) ;
   - la valeur exacte de l'URL, avec le `/` final.
4. Teste avec le téléphone : verrouille l'écran, déverrouille, approche la puce. Le navigateur doit s'ouvrir et rediriger.

Si la lecture affiche un texte au lieu d'une URL, réécris un enregistrement **URL/URI**. Les téléphones n'ouvrent pas automatiquement un simple texte.

## Étape 4 — Protéger la puce par mot de passe

La protection NTAG21x empêche l'écriture sans authentification. La lecture reste libre : n'importe quel téléphone peut encore lire l'URL. C'est exactement ce qu'on veut.

1. Ouvre **NFC Tools Pro** (Android).
2. Va dans **Autre** (ou **Other**) → **Protection par mot de passe** / **Password protection** (le libellé dépend de la version).
3. Choisis un mot de passe **PWD** de 4 octets, soit **8 caractères hexadécimaux** (`0-9`, `A-F`). Génère-le aléatoirement avec ton gestionnaire de mots de passe.
4. Choisis un **PACK** de 2 octets, soit **4 caractères hexadécimaux**. Génère-le aussi aléatoirement.
5. Indique la page de départ **4** (`AUTH0 = 0x04`) : la protection couvre toute la mémoire utilisateur à partir de la première page utilisateur.
6. Active la protection (`PROT = 1`).
7. Approche la puce et laisse l'application écrire.

Valeurs techniques appliquées :

| Paramètre | Valeur |
|---|---|
| PWD | 4 octets (8 hex), aléatoire, secret |
| PACK | 2 octets (4 hex), aléatoire |
| AUTH0 | `0x04` (protège toute la mémoire utilisateur) |
| ACCESS | bit `PROT` à `1` |

> **Ne confonds pas** « protection par mot de passe » et « verrouillage / lock ». Le verrouillage rend la puce définitivement en lecture seule : impossible de revenir en arrière. La protection par mot de passe est réversible avec le PWD. Utilise le mot de passe, pas le verrouillage.

> Une puce achetée d'occasion ou déjà protégée peut demander un mot de passe inconnu. Teste d'abord avec une puce neuve.

## Étape 5 — Tester la protection

1. Sans t'authentifier, essaie d'écrire un autre contenu sur la puce : l'écriture doit être refusée.
2. Authentifie-toi avec le PWD, puis vérifie que tu peux de nouveau écrire (tu peux réécrire la même URL pour tester).
3. Relis la puce : l'URL et la redirection doivent toujours fonctionner.

Si l'écriture sans mot de passe réussit, la protection n'est pas active : recommence l'étape 4.

## Étape 6 — Sauvegarder les informations

Note dans ton gestionnaire de mots de passe, dans une entrée dédiée :

- l'URL gravée : `https://lebofran6.github.io/NFCreproAdistance/` ;
- l'UID de la puce (affiché par NFC Tools) ;
- le **PWD** (8 hex) ;
- le **PACK** (4 hex) ;
- la date de gravure et le modèle (NTAG215).

Ne mets pas ces valeurs dans le dépôt GitHub.

Bonne nouvelle : comme l'URL de la puce ne change jamais, **perdre le mot de passe n'empêche pas le site de fonctionner**. Tu ne pourras simplement plus réécrire cette puce. C'est pour cela que la protection par mot de passe est plus souple qu'un verrouillage définitif.

## Dépannage

| Problème | Piste |
|---|---|
| La puce n'est pas détectée | NFC activé ; puce contre l'antenne (haut du dos) ; retire la coque ; essaie une autre puce ; évite le métal. |
| « Tag is read-only » / écriture impossible | La puce est verrouillée définitivement, ou protégée par un mot de passe inconnu. Une puce verrouillée ne peut pas être réutilisée. |
| « Password incorrect » | Le PWD fait 8 caractères hexadécimaux (4 octets), le PACK 4 (2 octets). Vérifie le clavier, les majuscules et ne confonds pas PWD et PACK. |
| La protection ne s'active pas | Utilise NFC Tools **Pro** et vérifie que la puce est bien une NTAG21x (NTAG213/215/216), pas une MIFARE Classic. |
| Le téléphone n'ouvre rien | L'enregistrement est peut-être un texte et non une URL ; réécris un enregistrement URL/URI. Vérifie aussi que la puce est lisible. |
| Le téléphone ouvre l'aperçu | L'URL contient `?preview=1` : réécris l'URL nue. |
| L'ancienne destination s'affiche | Le cache GitHub Pages ou le déploiement est en cours. Vérifie `?preview=1` et attends quelques minutes. |
| 404 GitHub Pages | Pages n'est pas activé, mauvaise branche/dossier, ou nom de dépôt différent. |
| Le lien casse après un renommage | L'URL de la puce est devenue invalide : il faut réécrire les puces. |

## Sécurité — ce que la protection fait et ne fait pas

- **Elle empêche la réécriture sans PWD.** C'est le but : un passant ne peut pas remplacer ton lien par le sien.
- **Elle ne chiffre rien.** L'URL reste lisible par n'importe quel téléphone.
- **Le PWD fait 32 bits** et il est envoyé en clair pendant l'authentification NFC. Un attaquant équipé peut l'écouter ou le bruteforcer. C'est une dissuasion contre le curieux, pas une sécurité de niveau bancaire.
- **Elle ne protège pas contre une copie.** Le site ne vérifie pas l'UID : une copie de l'URL ou de la puce fonctionne. La protection empêche seulement de modifier l'original.
- Pour un besoin de sécurité forte (authentification mutuelle, URL signée, anti-clonage), il faut une puce NTAG424 DNA et un backend. Ce projet ne le fait pas.

## Checklist finale

- [ ] URL finale testée dans le navigateur (et en aperçu).
- [ ] Dépôt GitHub public et GitHub Pages activé.
- [ ] `config.json` pointe vers la bonne destination.
- [ ] URL gravée sur la puce, avec le `/` final et sans `?preview=1`.
- [ ] Puce relue : type NTAG215, enregistrement URL, valeur exacte.
- [ ] Protection par mot de passe active (PWD + PACK + `AUTH0=4` + `PROT=1`).
- [ ] Écriture sans mot de passe refusée.
- [ ] PWD, PACK et UID sauvegardés hors du dépôt.
- [ ] Puce étiquetée physiquement (sans couvrir l'antenne).
- [ ] Puce de rechange prévue.
- [ ] Authentification à deux facteurs activée sur le compte GitHub.
