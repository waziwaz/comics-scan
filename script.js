// 1. Récupérer les paramètres d'abord !
const params = new URLSearchParams(window.location.search);
const mangaNom = params.get('manga') || "manyShot"; 
const chapitreNum = "01"; // Optionnel, pour le nom du fichier ZIP

// 2. Modifier l'affichage
document.title = `Lire ${mangaNom} en VF - Manga Reader`;
document.getElementById('chapitre-title').innerText = mangaNom;

const container = document.getElementById('pages-container');

function chargerPages(p = 1) {
    const imgPath = `scans/${mangaNom}/${mangaNom}-page-${p}-vf.png`;
    const img = new Image();
    img.src = imgPath;
    img.className = 'manga-page';
    img.alt = `${mangaNom} - Page ${p} - VF`;

    img.onload = function() {
        container.appendChild(img);
        chargerPages(p + 1); // Continue tant qu'une image est trouvée
    };
    img.onerror = function() {
        console.log(`Fin de lecture : ${p - 1} pages chargées.`);
    };
}

chargerPages();

// 3. Logique ZIP (Corrigée avec chapitreNum)
document.getElementById('downloadZip').addEventListener('click', async function() {
    const zip = new JSZip();
    const btn = this;
    const images = document.querySelectorAll('.manga-page');

    if (images.length === 0) return alert("Aucune page chargée.");

    btn.innerText = "Préparation...";
    btn.disabled = true;

    try {
        for (let i = 0; i < images.length; i++) {
            const response = await fetch(images[i].src);
            const blob = await response.blob();
            zip.file(`${String(i + 1).padStart(3, '0')}.png`, blob);
        }
        const content = await zip.generateAsync({type: "blob"});
        saveAs(content, `${mangaNom}_Chapitre.zip`);
    } catch (e) {
        alert("Erreur de téléchargement (CORS).");
    } finally {
        btn.innerText = "⬇ Télécharger (.zip)";
        btn.disabled = false;
    }
});