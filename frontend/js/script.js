document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const langToggle = document.querySelector('.toggle:nth-child(2) input[type="checkbox"]');
    const wordsToggle = document.querySelector('.toggle:nth-child(3) input[type="checkbox"]');
    const generateBtn = document.querySelector('.main-btn');
    const inputBox = document.querySelector('.input-box');
    
    //  Generate lang and words values
    const generateValues = () => {
        const langValue = langToggle.checked ? '-br' : '-en';
        const wordsValue = wordsToggle.checked ? '256' : '128';
        
        return { lang: langValue, words: wordsValue };
    };
    
    // Function to generate random number based on mouse movements
    const randomScratch = (callback) => {
        // Create UI elements for entropy collection
        const scratchContainer = document.createElement('div');
        scratchContainer.className = 'scratch-container';
        scratchContainer.innerHTML = `
            <p class="scratch-instruction">Move your mouse randomly</p>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
        `;
        
        // Add styles for the container
        const style = document.createElement('style');
        style.textContent = `
            .scratch-container {
                margin-top: 20px;
                padding: 15px;
                background-color: #f5f5f5;
                border-radius: 8px;
                text-align: center;
            }
            .scratch-instruction {
                margin-bottom: 10px;
                font-weight: bold;
            }
            .progress-bar {
                width: 100%;
                height: 20px;
                background-color: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
            }
            .progress {
                height: 100%;
                background-color: #4CAF50;
                width: 0%;
                transition: width 0.3s;
            }
        `;
        document.head.appendChild(style);
        
        // Insert container after the button
        generateBtn.parentNode.insertBefore(scratchContainer, generateBtn.nextSibling);
        
        const progressBar = scratchContainer.querySelector('.progress');
        const instruction = scratchContainer.querySelector('.scratch-instruction');
        
        let entropy = 0;
        let moves = 0;
        const maxMoves = 100;
        let timeoutId;
        
        // Function to handle mouse movements
        const handleMouseMove = (e) => {
            // Add entropy based on mouse position and time
            entropy += e.clientX + e.clientY + Date.now();
            moves++;
            
            // Update progress bar
            const progress = Math.min(100, (moves / maxMoves) * 100);
            progressBar.style.width = `${progress}%`;
            
            // Update instruction text
            if (moves < maxMoves / 3) {
                instruction.textContent = "Keep moving your mouse randomly...";
            } else if (moves < (maxMoves * 2) / 3) {
                instruction.textContent = "Almost there, continue moving!";
            } else {
                instruction.textContent = "Finalizing generation...";
            }
            
            // Check if we have enough entropy
            if (moves >= maxMoves) {
                finishEntropyCollection();
            }
        };
        
        // Function to finish entropy collection
        const finishEntropyCollection = () => {
            // Remove event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
            
            // Remove the container
            scratchContainer.remove();
            
            // Generate random number based on collected entropy
            const randomNumber = entropy % 1000000 / 1000000; //  Normalize to 0-1
            
            // Call callback with random number
            callback(randomNumber);
        };
        
        // Set timeout if user doesn't move mouse enough
        timeoutId = setTimeout(() => {
            instruction.textContent = "Movimentos insuficientes. Tentando gerar assim mesmo... / Not enough mouse movement. Trying to generate anyway...";
            setTimeout(finishEntropyCollection, 1000);
        }, 10000); // 10 seconds timeout
        
        // Start listening to mouse movements
        document.addEventListener('mousemove', handleMouseMove);
    };
    
    // Add click event to button
    generateBtn.addEventListener('click', () => {
        // Disable button during generation
        generateBtn.disabled = true;
        generateBtn.textContent = " Generating...";
        
        // Get configuration values
        const config = generateValues();
        
        // Start entropy collection
        randomScratch((randomNumber) => {
            // Generate mnemonic based on random number and configuration
            const mnemonic = generateMnemonic(randomNumber, config);
            
            // Display the mnemonic in the input box
            inputBox.textContent = mnemonic;
            
            // Re-enable the button
            generateBtn.disabled = false;
            generateBtn.textContent = "Generate Mnemonic";
        });
    });
    
    // Function to generate mnemonic (simplified example)
    const generateMnemonic = (randomNumber, config) => {
        // Este é apenas um placeholder para demonstração / This is just a placeholder for demonstration
        
        // Listas de palavras de exemplo (em um app real, seriam as listas BIP39 completas) / Example wordlists (in a real app, these would be complete BIP39 wordlists)
        const enWordlist = ["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse"];
        const ptWordlist = ["abacate", "abaixar", "abalar", "abandonar", "abastecer", "abater", "abdicar", "abeberar", "abdominal", "abdomen"];
        
        // Select wordlist based on language
        const wordlist = config.lang === '-en' ? enWordlist : ptWordlist;
        
        //Determine number of words based on config
        const wordCount = config.words === '128' ? 12 : 24;
        
        //enerate mnemonic words
        let mnemonic = "";
        for (let i = 0; i < wordCount; i++) {
            // Use the random number to pick a word
            const index = Math.floor(randomNumber * wordlist.length * 1000) % wordlist.length;
            mnemonic += wordlist[index];
            
            if (i < wordCount - 1) {
                mnemonic += " ";
            }
            
            //  Modify the random number for the next word
            randomNumber = (randomNumber * 9301 + 49297) % 233280;
        }
        
        return mnemonic;
    }
});