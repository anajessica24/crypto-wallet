document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const langToggle = document.querySelector('.toggle:nth-child(2) input[type="checkbox"]');
    const wordsToggle = document.querySelector('.toggle:nth-child(3) input[type="checkbox"]');
    const generateBtn = document.querySelector('.main-btn');
    const inputBox = document.querySelector('.input-box');
    const copyBtn = document.querySelector('.copy-btn');
   
    // Generate lang and words values
    const generateValues = () => {
        const langValue = langToggle.checked ? 'br' : 'en';
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
     
        // Insert container after the button
        generateBtn.parentNode.insertBefore(scratchContainer, generateBtn.nextSibling);
       
        const progressBar = scratchContainer.querySelector('.progress');
        const instruction = scratchContainer.querySelector('.scratch-instruction');
       
        let entropyData = [];
        let moves = 0;
        const maxMoves = 100;
        let timeoutId;
       
        // Function to handle mouse movements
        const handleMouseMove = (e) => {
            // Add entropy based on mouse position and time
            const dataPoint = {
                x: e.clientX,
                y: e.clientY,
                time: Date.now()
            };
            entropyData.push(dataPoint);
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
           
            // Convert entropy data to string
            const entropyString = JSON.stringify(entropyData);
           
            // Call callback with the entropy data
            callback(entropyString);
        };
       
        // Set timeout if user doesn't move mouse enough
        timeoutId = setTimeout(() => {
            instruction.textContent = "Not enough mouse movement. Trying to generate anyway...";
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
        console.log(config);
       
        randomScratch((randomNumber) => { 
            // Here we receive the final value
            const customEntropy = randomNumber;
            // console.log("Inside callback:", customEntropy);
            
            // Send to backend
            fetch(`http://localhost:5001/generate?lan=${config.lang}&words=${config.words}&entropy=${encodeURIComponent(customEntropy)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // console.log("Backend result:", data);
                    
                    // Display mnemonic in the input box
                    if (data.mnemonic) {
                        inputBox.textContent = data.mnemonic;
                    } else {
                        inputBox.textContent = "Error: " + (data.error || "Unknown error");
                    }
                    
                    // Reset button
                    generateBtn.disabled = false;
                    generateBtn.textContent = "Generate mnemonic";
                })
                .catch(error => {
                    console.error('Error:', error);
                    inputBox.textContent = "Error generating mnemonic. Please try again.";
                    generateBtn.disabled = false;
                    generateBtn.textContent = "Generate mnemonic";
                });
        });
    });
    
    // Add copy functionality
    copyBtn.addEventListener('click', () => {
        if (inputBox.textContent) {
            navigator.clipboard.writeText(inputBox.textContent)
                .then(() => {
                    // Show success feedback
                    const originalIcon = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalIcon;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        }
    });
});