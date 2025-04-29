document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const translateBtn = document.getElementById('translateBtn');
    const languageSelect = document.getElementById('languageSelect');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    let fileContent = null;
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        fileName.textContent = file.name;
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
        
        const targetLanguage = languageSelect.value;
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        translateBtn.disabled = true;
        
        // Use the LibreTranslate API (free and open source)
        fetch('https://libretranslate.de/translate', {
            method: 'POST',
            body: JSON.stringify({
                q: fileContent,
                source: 'auto',
                target: targetLanguage
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Translation failed');
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
            a.download = 'translated_' + (fileName.textContent || 'file.txt');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Reset the form
            fileInput.value = '';
            fileName.textContent = '';
            translateBtn.disabled = true;
        })
        .catch(error => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            alert('Error translating file: ' + error.message);
            translateBtn.disabled = false;
        });
    });
});
