// script.js – VERSION FINALE (date d'embauche brute, pas de calcul ancienneté)

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwN0KW4QB8CGkzfesYG6G4aHau7_rYjz8_NDL8yJ_nVcSpH5lD_hjpUktJ7AX-f2Duq/exec";

function getCurrentSheet() {
  const params = new URLSearchParams(window.location.search);
  return params.get("sheet") || "Multimédia";
}

const SHEET_NAME = getCurrentSheet();

document.addEventListener("DOMContentLoaded", () => {
  document.title = `FRC - ${SHEET_NAME}`;
  loadData();
});

let data = [];

async function loadData() {
  try {
    showMessage("Chargement des données...", "loading");
    const url = `${SCRIPT_URL}?action=getData&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Erreur inconnue");

    data = json.data || [];
    populateSelect();
    showMessage("Prêt ! Sélectionne un collaborateur", "success");
  } catch (err) {
    showMessage("Erreur de chargement : " + err.message, "error");
  }
}

function populateSelect() {
  const select = document.getElementById("personne");
  select.innerHTML = '<option value="">-- Choisir un collaborateur --</option>';
  data.forEach((row, i) => {
    const matricule = (row[0] || "").toString().trim();
    const nom = (row[1] || "").toString().trim();
    if (matricule && nom) {
      select.add(new Option(`${matricule} - ${nom}`, i));
    }
  });
}

// === AFFICHAGE INFOS + DATE D'EMBAUCHE + NIVEAUX FRC ===
document.getElementById("personne").addEventListener("change", function () {
  const idx = this.value;
  const infoCard = document.getElementById("info");

  // Reset des selects FRC
  ["frc1", "frc4", "frc7"].forEach(id => document.getElementById(id).value = "");

  if (idx === "" || !data[idx]) {
    infoCard.style.display = "none";
    return;
  }

  const row = data[idx];

  // Ajuste les indices selon ta feuille Google Sheets
  const nom           = (row[1] || "Non renseigné").trim();
  const fonction      = (row[2] || "Non renseigné").trim();
  const dateEmbauche  = row[3] ? row[3].toString().trim() : "Non renseignée";
  
  // FRC existants (ajuste si tes colonnes sont ailleurs !)
  const niveauFRC4  = row[4] ? row[4].toString().trim() : "";
  const niveauFRC7  = row[5] ? row[5].toString().trim() : "";
  const niveauFRC13 = row[6] ? row[6].toString().trim() : "";

  // Remplissage des infos
  document.getElementById("nom").textContent = nom;
  document.getElementById("fonction").textContent = fonction;
  document.getElementById("ancienneteValeur").textContent = dateEmbauche; // ← juste la date brute

  // Pré-remplissage des niveaux FRC
  if (niveauFRC4)  document.getElementById("frc1").value = niveauFRC4;
  if (niveauFRC7)  document.getElementById("frc4").value = niveauFRC7;
  if (niveauFRC13) document.getElementById("frc7").value = niveauFRC13;

  infoCard.style.display = "block";
});

// === FONCTION MESSAGE (inchangée) ===
function showMessage(text, type = "success") {
  const el = document.getElementById("message");
  el.textContent = text;
  el.className = `message ${type}`;
  el.style.display = "block";
  setTimeout(() => {
    if (el.textContent === text) el.style.display = "none";
  }, 5000);
}

// === ENVOI DU FORMULAIRE ===
document.getElementById("submitBtn").addEventListener("click", async () => {
  const idx = document.getElementById("personne").value;
  if (!idx) return showMessage("Veuillez choisir un collaborateur", "error");

  const frc1 = document.getElementById("frc1").value;
  const frc4 = document.getElementById("frc4").value;
  const frc7 = document.getElementById("frc7").value;
  if (!frc1 || !frc4 || !frc7) return showMessage("Tous les niveaux doivent être sélectionnés", "error");

  const formData = new FormData();
  formData.append("action", "updateFRC");
  formData.append("sheet", SHEET_NAME);
  formData.append("rowIndex", idx);
  formData.append("frc1", frc1);
  formData.append("frc4", frc4);
  formData.append("frc7", frc7);

  try {
    showMessage("Enregistrement en cours...", "loading");
    const res = await fetch(SCRIPT_URL, { method: "POST", body: formData });
    const json = await res.json();

    if (json.status === "success") {
      showMessage("Enregistré avec succès !", "success");
    } else {
      showMessage("Erreur : " + (json.message || "inconnue"), "error");
    }
  } catch (err) {
    showMessage("Erreur réseau : " + err.message, "error");
  }
});

// text