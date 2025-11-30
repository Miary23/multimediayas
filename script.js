// script.js – POUR HTML EXTERNE (VS Code, GitHub Pages, etc.)

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwN0KW4QB8CGkzfesYG6G4aHau7_rYjz8_NDL8yJ_nVcSpH5lD_hjpUktJ7AX-f2Duq/exec";

// Récupère la feuille depuis l'URL (?sheet=Appel%20Entrant ou ?sheet=Multimédia)
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
    const url = `${SCRIPT_URL}?action=getData&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message);
    data = json.data || [];
    populateSelect();
  } catch (err) {
    alert("Erreur chargement : " + err.message);
  }
}

function populateSelect() {
  const select = document.getElementById("personne");
  select.innerHTML = '<option value="">-- Choisir --</option>';
  data.forEach((row, i) => {
    const matricule = (row[0] || "").toString().trim();
    const nom = (row[1] || "").toString().trim();
    select.add(new Option(`${matricule} - ${nom}`, i));
  });
}

// ... (le reste de ton code pour afficher infos + ancienneté reste IDENTIQUE)

// Envoi du formulaire
document.getElementById("submitBtn").addEventListener("click", async () => {
  const idx = document.getElementById("personne").value;
  if (!idx) return alert("Choisis une personne");

  const formData = new FormData();
  formData.append("action", "updateFRC");
  formData.append("sheet", SHEET_NAME);
  formData.append("rowIndex", idx);
  formData.append("frc1", document.getElementById("frc1").value);
  formData.append("frc4", document.getElementById("frc4").value);
  formData.append("frc7", document.getElementById("frc7").value);

  try {
    const res = await fetch(SCRIPT_URL, { method: "POST", body: formData });
    const json = await res.json();
    alert(json.status === "success" ? "Enregistré !" : "Erreur : " + json.message);
  } catch (err) {
    alert("Erreur réseau : " + err.message);
  }
});