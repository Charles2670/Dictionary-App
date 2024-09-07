const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const result = document.getElementById("result");
const sound = document.getElementById("sound");
const btn = document.getElementById("search-btn");
const recentSearches = document.getElementById("recent-searches");

btn.addEventListener("click", () => {
    let inpWord = document.getElementById("inp-word").value.trim();
    if (!inpWord) return; // Do nothing if input is empty

    // Show loading spinner
    result.innerHTML = `<div class="loading">Loading...</div>`;
    
    fetch(`${url}${inpWord}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.title) {
                // If API returns an error
                result.innerHTML = `<h3 class="error">Couldn't Find The Word</h3>`;
                return;
            }

            console.log(data);
            displayWordDetails(data[0], inpWord);
            addToRecentSearches(inpWord);
        })
        .catch(() => {
            result.innerHTML = `<h3 class="error">Couldn't Find The Word</h3>`;
        });
});

function displayWordDetails(data, word) {
    const phonetics = data.phonetics.map((phonetic) => phonetic.text).filter(Boolean).join(", ");
    const synonyms = data.meanings[0].definitions[0].synonyms || [];
    const antonyms = data.meanings[0].definitions[0].antonyms || [];
    
    // Generate the HTML for the word details
    result.innerHTML = `
        <div class="word">
            <h3>${word}</h3>
            <button onclick="playSound()">
                <i class="fas fa-volume-up"></i>
            </button>
        </div>
        <div class="details">
            <p><strong>Part of Speech:</strong> ${data.meanings[0].partOfSpeech}</p>
            <p><strong>Phonetic:</strong> /${phonetics || ""}/</p>
        </div>
        <p class="word-meaning">
           <strong>Meaning:</strong> ${data.meanings[0].definitions[0].definition}
        </p>
        <p class="word-example">
            <strong>Example:</strong> ${data.meanings[0].definitions[0].example || "N/A"}
        </p>
        <p class="word-synonyms">
            <strong>Synonyms:</strong> ${synonyms.length > 0 ? synonyms.join(", ") : "None"}
        </p>
        <p class="word-antonyms">
            <strong>Antonyms:</strong> ${antonyms.length > 0 ? antonyms.join(", ") : "None"}
        </p>`;

    // Check if there is a valid audio file and set the source
    const audioUrl = data.phonetics.find((phonetic) => phonetic.audio);
    if (audioUrl && audioUrl.audio) {
        sound.setAttribute("src", audioUrl.audio); // Use the provided audio URL
    } else {
        sound.setAttribute("src", ""); // No audio available
        alert("Audio not available for this word.");
    }
}

function playSound() {
    if (sound.getAttribute("src")) {
        sound.play();
    } else {
        alert("Audio not available for this word.");
    }
}

function addToRecentSearches(word) {
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if (!searches.includes(word)) {
        searches.push(word);
        if (searches.length > 5) searches.shift(); // Keep only the last 5 searches
        localStorage.setItem("recentSearches", JSON.stringify(searches));
        updateRecentSearchesUI();
    }
}

function updateRecentSearchesUI() {
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    recentSearches.innerHTML = searches
        .map(search => `<button class="recent-word" onclick="reSearch('${search}')">${search}</button>`)
        .join(" ");
}

function reSearch(word) {
    document.getElementById("inp-word").value = word;
    btn.click();
}

// Initialize recent searches on page load
updateRecentSearchesUI();
