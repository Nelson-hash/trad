document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileStatus = document.getElementById('fileStatus');
    const translateBtn = document.getElementById('translateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    let fileContent = null;
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            fileStatus.textContent = "Aucun fichier n'a été sélectionné";
            translateBtn.disabled = true;
            return;
        }
        
        fileStatus.textContent = "Fichier sélectionné: " + file.name;
        translateBtn.disabled = false;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            fileContent = e.target.result;
        };
        reader.readAsText(file);
    });
    
    // Handle translation
    translateBtn.addEventListener('click', function() {
        if (!fileContent) return;
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        translateBtn.disabled = true;
        
        // Use the LibreTranslate API (free and open source)
        fetch('https://libretranslate.de/translate', {
            method: 'POST',
            body: JSON.stringify({
                q: fileContent,
                source: 'fr',  // French source
                target: 'en'   // English target
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('La traduction a échoué');
            }
            return response.json();
        })
        .then(data => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            // Create and download the translated file
            const translatedText = data.translatedText;
            const blob = new Blob([translatedText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'translated_' + fileInput.files[0].name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Reset the form
            fileInput.value = '';
            fileStatus.textContent = "Aucun fichier n'a été sélectionné";
            translateBtn.disabled = true;
            fileContent = null;
        })
        .catch(error => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            alert('Erreur de traduction: ' + error.message);
            translateBtn.disabled = false;
        });
    });
