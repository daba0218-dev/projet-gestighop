# GestiShop – Gestion des produits

Application web de gestion de produits réalisée dans le cadre du TP « GestiShop » : un CRUD complet (créer, afficher, modifier, supprimer) en JavaScript, sans framework.

## Technologies utilisées

- HTML5
- CSS3 (grille, flexbox, image de fond)
- JavaScript « vanilla » (DOM, JSON, LocalStorage, méthodes `map`, `filter`, `reduce`, `find`)

## Comment lancer le projet

1. Décompresser le dossier `tp-gestishop`.
2. L'ouvrir dans VS Code.
3. Installer l'extension **Live Server** (si elle n'est pas déjà installée).
4. Faire un clic droit sur `index.html`, puis choisir **Open with Live Server**.

> Un double-clic sur `index.html` ne fonctionne pas : `app.js` est chargé avec `type="module"` (à cause du `export` de `data.js`), ce qui nécessite un serveur local.

## Structure du projet

```
tp-gestishop/
├── index.html   → formulaire, barre de recherche, tableau, statistiques
├── style.css    → mise en forme
├── app.js       → toute la logique JavaScript
├── data.js      → les 10 produits de départ
└── image.png    → image de fond
```

## Fonctionnalités réalisées

- **Affichage** des produits dans un tableau généré avec `map`, avec la colonne **Total** (prix × quantité) calculée à l'affichage.
- **Mise en évidence** des produits en rupture de stock (ligne rouge).
- **Ajout** d'un produit avec validation des champs et messages d'erreur sous chaque champ ; l'`id` est généré avec `reduce` (plus grand id + 1).
- **Modification** d'un produit : le formulaire se remplit, le bouton « Ajouter » devient « Enregistrer », et le bouton « Annuler » remet le formulaire en mode ajout.
- **Suppression** d'un produit avec confirmation, grâce à un seul écouteur d'événement sur le `<tbody>` (délégation d'événements) et l'attribut `data-id`.
- **Sauvegarde** dans le LocalStorage avec `JSON.stringify` et `JSON.parse` : les données restent après un rechargement de la page.
- **Recherche** par nom et **filtre** par catégorie, qui fonctionnent ensemble.
- **Statistiques** mises à jour après chaque opération : nombre de produits, valeur totale du stock, produits en rupture, note moyenne.
- **Bouton « Réinitialiser »** qui remet les données d'origine de `data.js` après confirmation.
- Message « Aucun produit » quand la liste est vide.

## Difficultés rencontrées

Le HTML et le CSS ne m'ont pas posé de problème particulier. Ma principale difficulté a été **le JavaScript**, surtout pour comprendre le rôle de chaque ligne et pour organiser mon code. Voici les points qui m'ont demandé le plus d'efforts, et ce que j'ai fini par comprendre.

**1. Importer les données et en faire une copie modifiable.**
Je ne comprenais pas pourquoi il fallait écrire `import { produits as produitsInitiaux }` puis `let produits = [...produitsInitiaux]`. J'ai compris que `as` renomme ce qu'on importe pour éviter deux variables du même nom, que les trois points `...` (opérateur de décomposition) créent une copie du tableau, et qu'il faut utiliser `let` et non `const` parce que `produits` est réassigné (par exemple avec `filter` lors d'une suppression).

**2. Construire le tableau avec `map`, `innerHTML` et les template literals.**
La fonction `afficherProduits` était la partie la plus confuse au début. J'ai compris que `map` transforme chaque produit en une ligne HTML, que `${ }` insère une valeur dans un texte écrit entre accents graves, que `join("")` colle les morceaux en un seul texte, et que `innerHTML` place ce texte dans le `<tbody>`. J'ai aussi fait l'erreur d'utiliser une apostrophe à la place d'un accent grave, ce qui a provoqué plusieurs erreurs en cascade.

**3. Découper le code en petites fonctions.**
Je ne voyais pas le lien entre `classeLigne` et `afficherProduits`. J'ai compris qu'une fonction peut **renvoyer une valeur** (`return`) et qu'on peut l'appeler dans un `${ }` : `classeLigne` décide de la classe CSS « rupture », et `afficherProduits` l'utilise pour construire chaque ligne.

**4. Utiliser `reduce`.**
`reduce` m'a demandé de la concentration. Je l'ai compris en le voyant comme une caisse enregistreuse : une valeur de départ, un total qui évolue à chaque produit, et un résultat final. Je l'utilise pour la valeur totale du stock, la note moyenne et le plus grand `id`.

**5. Le LocalStorage et le JSON.**
J'ai compris que le LocalStorage ne stocke que du texte : il faut donc transformer le tableau avec `JSON.stringify` avant de l'enregistrer, et le retransformer avec `JSON.parse` en le relisant. J'ai aussi compris le rôle de `null` : au premier lancement, rien n'est sauvegardé, donc on part des données de `data.js`.

**6. Les événements.**
Au début, mes boutons ne faisaient rien, car je n'avais pas encore compris qu'un bouton HTML a besoin d'un écouteur (`addEventListener`). J'ai appris que `event.preventDefault()` empêche le rechargement de la page à l'envoi du formulaire, et qu'on utilise un seul écouteur sur le `<tbody>` (délégation d'événements) avec `data-id` pour savoir quel produit est concerné, puisque les boutons sont recréés à chaque affichage.

**7. L'ordre du code et les accolades.**
J'ai eu plusieurs erreurs à cause de l'organisation de mon fichier : une variable `let` utilisée avant d'être créée, deux déclarations de `produits`, et un écouteur d'événement écrit **à l'intérieur** d'une fonction au lieu d'être en dehors, ce qui l'empêchait de fonctionner. J'ai appris à lire les messages d'erreur de la console (`F12`) et à toujours vérifier où une fonction commence et se termine.

**8. Gérer deux modes avec le même formulaire (ajout et modification).**
J'ai compris qu'une variable (`idEnModification`) peut servir de « mémoire » : si elle vaut `null`, le formulaire ajoute un produit, sinon il modifie celui dont l'id est stocké. J'ai aussi appris à utiliser `find` pour retrouver un produit et `map` pour remplacer un seul produit dans le tableau en gardant les autres.

## Ce que j'ai appris

- À lire les erreurs de la console pour trouver ce qui bloque.
- À écrire des fonctions courtes qui ont chacune une seule responsabilité.
- À tester chaque étape avant de passer à la suivante.
- À expliquer mon code ligne par ligne, y compris les parties qui m'ont paru difficiles au départ.

## Utilisation d'un assistant IA

Comme l'autorise l'énoncé, j'ai utilisé un assistant IA pour avancer étape par étape. Je lui ai demandé d'expliquer le rôle de chaque ligne de code, et j'ai relu et testé le code à chaque étape afin de pouvoir l'expliquer à l'oral.