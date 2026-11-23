import { produits as produitsInitiaux } from "./data.js";

// =====================================================
// 1. DONNÉES ET LOCALSTORAGE
// =====================================================

// Au démarrage : récupérer les produits sauvegardés, sinon ceux de data.js
function charger() {
  const texte = localStorage.getItem("gestishop_produits");
  if (texte === null) {
    return [...produitsInitiaux];
  } else {
    return JSON.parse(texte);
  }
}

// Après chaque changement : écrire le tableau dans le LocalStorage
function sauvegarder() {
  localStorage.setItem("gestishop_produits", JSON.stringify(produits));
}

let produits = charger();

// null = on est en mode "ajout" ; un nombre = id du produit qu'on est en train de modifier
let idEnModification = null;

// =====================================================
// 2. ÉLÉMENTS DE LA PAGE
// =====================================================

const tbody = document.querySelector("#liste");
const formulaire = document.querySelector("#formulaire");
const boutonValider = document.querySelector("#btn-valider");

// =====================================================
// 3. AFFICHAGE
// =====================================================

// Décide de la classe CSS d'une ligne : "rupture" si le stock vaut 0
function classeLigne(p) {
  if (p.stock === 0) {
    return "rupture";
  } else {
    return "";
  }
}

// Construit les lignes du tableau pour la liste reçue
function afficherProduits(liste) {
  tbody.innerHTML = liste.map(p => `
    <tr class="${classeLigne(p)}">
      <td>${p.id}</td>
      <td>${p.nom}</td>
      <td>${p.categorie}</td>
      <td>${p.prix.toLocaleString("fr-FR")}</td>
      <td>${p.stock}</td>
      <td>${p.note}</td>
      <td>${(p.prix * p.stock).toLocaleString("fr-FR")}</td>
      <td>
        <button class="modifier" data-id="${p.id}">Modifier</button>
        <button class="supprimer" data-id="${p.id}">Supprimer</button>
      </td>
    </tr>`).join("");

  // Liste vide : on montre le message et on cache le tableau
  const message = document.querySelector("#message-vide");
  const tableau = document.querySelector("#tableau");

  if (liste.length === 0) {
    message.style.display = "block";
    tableau.style.display = "none";
  } else {
    message.style.display = "none";
    tableau.style.display = "table";
  }
}

// Calcule et affiche les 4 statistiques
function calculerStatistiques(liste) {
  const nombre = liste.length;
  const enRupture = liste.filter(p => p.stock === 0).length;

  document.querySelector("#stat-produit").textContent = nombre;
  document.querySelector("#stat-rupture").textContent = enRupture;

  const valeurTotale = liste.reduce((somme, p) => somme + p.prix * p.stock, 0);
  document.querySelector("#stat-valeur").textContent = valeurTotale.toLocaleString("fr-FR");

  let moyenne = 0;
  if (liste.length > 0) {
    const sommeNotes = liste.reduce((somme, p) => somme + p.note, 0);
    moyenne = sommeNotes / liste.length;
  }
  document.querySelector("#stat-note").textContent = moyenne.toFixed(1);
}

// Renvoie les produits qui correspondent à la recherche ET à la catégorie choisie
function listeFiltree() {
  const texte = document.querySelector("#recherche").value.toLowerCase();
  const categorie = document.querySelector("#filtre-categorie").value;

  return produits.filter(p => {
    const nomOk = p.nom.toLowerCase().includes(texte);
    const categorieOk = categorie === "" || p.categorie === categorie;
    return nomOk && categorieOk;
  });
}

// Après chaque changement : sauvegarder, réafficher, recalculer
function rafraichir() {
  sauvegarder();
  afficherProduits(listeFiltree());
  calculerStatistiques(produits);
}

// =====================================================
// 4. FORMULAIRE : VALIDATION, AJOUT, MODIFICATION, ANNULATION
// =====================================================

// Écrit un message dans le <span id="erreur-..."> du champ
function afficherErreur(champ, message) {
  document.querySelector("#erreur-" + champ).textContent = message;
}

// Vérifie les 5 champs. Renvoie true si tout est bon, sinon false
function validerFormulaire(nom, categorie, prix, stock, note) {
  let valide = true;

  // On efface d'abord les anciens messages
  ["nom", "categorie", "prix", "stock", "note"].forEach(c => afficherErreur(c, ""));

  if (nom.length < 2) {
    afficherErreur("nom", "Le nom doit avoir au moins 2 caractères");
    valide = false;
  }
  if (categorie === "") {
    afficherErreur("categorie", "Choisis une catégorie");
    valide = false;
  }
  if (prix === "" || Number(prix) <= 0) {
    afficherErreur("prix", "Le prix doit être supérieur à 0");
    valide = false;
  }
  if (stock === "" || Number(stock) < 0 || Number(stock) % 1 !== 0) {
    afficherErreur("stock", "Le stock doit être un entier supérieur ou égal à 0");
    valide = false;
  }
  if (note === "" || Number(note) < 0 || Number(note) > 5) {
    afficherErreur("note", "La note doit être entre 0 et 5");
    valide = false;
  }

  return valide;
}

// Lit les champs et les valide. Renvoie les données (nombres convertis) ou null si invalide
function lireFormulaire() {
  const nom = document.querySelector("#nom").value.trim();
  const categorie = document.querySelector("#categorie").value;
  const prix = document.querySelector("#prix").value;
  const stock = document.querySelector("#stock").value;
  const note = document.querySelector("#note").value;

  if (validerFormulaire(nom, categorie, prix, stock, note) === false) {
    return null;
  }

  return {
    nom: nom,
    categorie: categorie,
    prix: Number(prix),
    stock: Number(stock),
    note: Number(note)
  };
}

// Remet le formulaire en mode "ajout"
function annuler() {
  formulaire.reset();
  idEnModification = null;
  boutonValider.textContent = "Ajouter";
  ["nom", "categorie", "prix", "stock", "note"].forEach(c => afficherErreur(c, ""));
}

// Ajoute un nouveau produit
function ajouterProduit() {
  const donnees = lireFormulaire();
  if (donnees === null) {
    return;
  }

  // Nouvel id = plus grand id existant + 1
  const nouvelId = produits.reduce((max, p) => Math.max(max, p.id), 0) + 1;

  produits.push({
    id: nouvelId,
    nom: donnees.nom,
    categorie: donnees.categorie,
    prix: donnees.prix,
    stock: donnees.stock,
    note: donnees.note
  });

  rafraichir();
  annuler();
}

// Clic sur "Modifier" : remplit le formulaire avec le produit choisi
function commencerModification(id) {
  const produit = produits.find(p => p.id === id);

  document.querySelector("#nom").value = produit.nom;
  document.querySelector("#categorie").value = produit.categorie;
  document.querySelector("#prix").value = produit.prix;
  document.querySelector("#stock").value = produit.stock;
  document.querySelector("#note").value = produit.note;

  idEnModification = id;
  boutonValider.textContent = "Enregistrer";
  window.scrollTo(0, 0);
}

// Clic sur "Enregistrer" : remplace le produit modifié dans le tableau
function modifierProduit() {
  const donnees = lireFormulaire();
  if (donnees === null) {
    return;
  }

  produits = produits.map(p => {
    if (p.id === idEnModification) {
      return {
        id: p.id,
        nom: donnees.nom,
        categorie: donnees.categorie,
        prix: donnees.prix,
        stock: donnees.stock,
        note: donnees.note
      };
    } else {
      return p;
    }
  });

  rafraichir();
  annuler();
}

// =====================================================
// 5. SUPPRESSION ET RÉINITIALISATION
// =====================================================

// Supprime le produit dont l'id est reçu, après confirmation
function supprimerProduit(id) {
  const confirmation = confirm("Voulez-vous vraiment supprimer ce produit ?");
  if (confirmation === true) {
    produits = produits.filter(p => p.id !== id);
    if (id === idEnModification) {
      annuler();
    }
    rafraichir();
  }
}

// Remet les données d'origine de data.js, après confirmation
function reinitialiser() {
  const confirmation = confirm("Remettre les données d'origine ? Vos changements seront perdus.");
  if (confirmation === true) {
    produits = [...produitsInitiaux];
    document.querySelector("#recherche").value = "";
    document.querySelector("#filtre-categorie").value = "";
    annuler();
    rafraichir();
  }
}

// =====================================================
// 6. ÉCOUTEURS D'ÉVÉNEMENTS
// =====================================================

// Clic sur "Ajouter" / "Enregistrer" : selon le mode, on ajoute ou on modifie
formulaire.addEventListener("submit", function (event) {
  event.preventDefault();
  if (idEnModification === null) {
    ajouterProduit();
  } else {
    modifierProduit();
  }
});

// Bouton "Annuler"
document.querySelector("#btn-annuler").addEventListener("click", annuler);

// Recherche : à chaque lettre tapée, on réaffiche la liste filtrée
document.querySelector("#recherche").addEventListener("input", function () {
  afficherProduits(listeFiltree());
});

// Filtre par catégorie : quand on change d'option, on réaffiche la liste filtrée
document.querySelector("#filtre-categorie").addEventListener("change", function () {
  afficherProduits(listeFiltree());
});

// Un seul écouteur sur le tbody pour tous les boutons des lignes (délégation)
tbody.addEventListener("click", function (event) {
  const bouton = event.target;
  const id = Number(bouton.dataset.id);

  if (bouton.classList.contains("supprimer")) {
    supprimerProduit(id);
  }
  if (bouton.classList.contains("modifier")) {
    commencerModification(id);
  }
});

// Bouton "Réinitialiser"
document.querySelector("#btn-reinitialiser").addEventListener("click", reinitialiser);

// =====================================================
// 7. DÉMARRAGE
// =====================================================

afficherProduits(produits);
calculerStatistiques(produits);