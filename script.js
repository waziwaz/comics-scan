// 1. Récupérer le numéro du chapitre dans l'URL (ex: lecture.html?ch=2)
const params = new URLSearchParams(window.location.search);
const chapitreNum = params.get('ch') || "1"; 
document.getElementById('chapitre-title').innerText = `${chapitreNum}`;

const container = document.getElementById('pages-container');

// 2. Fonction récursive pour charger les pages une par une sans erreur CORS
function chargerPages(p = 1) {
    const imgPath = `scans/${chapitreNum}/${p}.png`;
    const img = new Image();
    img.src = imgPath;
    img.className = 'manga-page';

    img.onload = function() {
        // Si l'image existe, on l'ajoute au conteneur
        container.appendChild(img);
        // On tente de charger la page suivante
        chargerPages(p + 1);
    };

    img.onerror = function() {
        // Dès qu'une image ne charge pas, on s'arrête
        console.log(`Fin du chapitre : ${p - 1} pages chargées.`);
    };
}

// Lancer le chargement au démarrage
chargerPages();

// 3. Logique de téléchargement ZIP
document.getElementById('downloadZip').addEventListener('click', async function() {
    const zip = new JSZip();
    const btn = this;
    const images = document.querySelectorAll('.manga-page');

    if (images.length === 0) {
        alert("Aucune page à télécharger.");
        return;
    }

    btn.innerText = "Préparation du ZIP...";
    btn.disabled = true;

    try {
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const response = await fetch(img.src);
            const blob = await response.blob();
            const fileName = `${String(i + 1).padStart(3, '0')}.png`;
            zip.file(fileName, blob);
        }

        const content = await zip.generateAsync({type: "blob"});
        saveAs(content, `Manga_Chapitre_${chapitreNum}.zip`);
    } catch (error) {
        console.error(error);
        alert("Erreur : Le téléchargement ZIP nécessite un serveur (Live Server ou GitHub Pages).");
    } finally {
        btn.innerText = "⬇ Télécharger (.zip)";
        btn.disabled = false;
    }
});