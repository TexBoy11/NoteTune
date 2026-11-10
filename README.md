# NoteTune FFT — Détecteur de notes et accordeur chromatique

## Présentation

**NoteTune FFT** est une application web de traitement du signal. Elle écoute le microphone, détecte la fréquence fondamentale d'une note musicale et indique si l'instrument est accordé.

## Technologies utilisées

- **HTML5** : structure de la page et éléments `<canvas>`.
- **CSS3** : interface sombre, cartes, jauge d'accordage et adaptation aux écrans.
- **JavaScript** : logique de l'application et calculs de traitement du signal.
- **Web Audio API** : capture du microphone et création du signal de test.
- **AnalyserNode / FFT** : observation du spectre fréquentiel.
- **Autocorrélation** : estimation de la fréquence fondamentale.

## Fonctionnalités

- Démarrage et arrêt du microphone.
- Détection automatique de la fréquence d'une note.
- Affichage du nom de la note et de son octave.
- Calcul de l'écart de justesse en cents.
- Jauge visuelle : bémol, juste ou dièse.
- Affichage du signal temporel.
- Affichage du spectre fréquentiel obtenu par FFT.
- Test intégré de la note **La4 à 440 Hz**.
- Arrêt du test intégré.
- Historique des notes détectées.

## Principe scientifique

1. Le microphone capture un signal audio.
2. Le signal est étudié dans le domaine fréquentiel avec la FFT.
3. L'autocorrélation estime la période du signal.
4. La fréquence est calculée avec `f = fréquence_échantillonnage / période`.
5. La fréquence est convertie en note grâce à :

   `MIDI = 69 + 12 × log2(f / 440)`

6. L'écart d'accordage est exprimé en cents.

Le rendu est conservé dans `style.css` et la logique reste volontairement simple dans `app.js`.

Elle utilise :

- l'API Web Audio pour capturer le microphone ;
- une FFT via `AnalyserNode` pour afficher le spectre ;
- une autocorrélation du signal temporel pour estimer la fréquence fondamentale ;
- la formule `MIDI = 69 + 12 log2(f / 440)` pour convertir la fréquence en note ;
- l'écart en cents pour guider l'accordage.

## Vérification rapide

1. Lancer le serveur avec `lancer-serveur.bat`.
2. Ouvrir <http://127.0.0.1:8000/>.
3. Cliquer sur **Tester La4 (440 Hz)** : l'application doit afficher `La`, environ `440 Hz` et `0 cents`.
4. Cliquer sur **Démarrer le micro** pour tester un instrument réel.

## Lancer l'application

### Methode recommandee sous Windows

Double-cliquer sur `lancer-serveur.bat`. Le navigateur s'ouvrira automatiquement à la bonne adresse :

<http://127.0.0.1:8000/>

Laisser la fenêtre noire ouverte pendant l'utilisation de l'application. Pour arrêter le serveur, fermer cette fenêtre.

### Methode manuelle

Depuis ce dossier, lancer un serveur local :

```powershell
python -m http.server 8000
```

Puis ouvrir précisément <http://127.0.0.1:8000/> dans Chrome ou Edge et autoriser l'accès au microphone.

Si le port 8000 est déjà utilisé, lancer :

```powershell
python -m http.server 8080
```

Puis ouvrir <http://127.0.0.1:8080/>.

Le microphone est généralement bloqué lorsque la page est ouverte directement en `file://`. Le serveur local est donc recommandé.
