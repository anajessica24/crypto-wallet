document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const langToggle = document.querySelector('.toggle:nth-child(2) input[type="checkbox"]');
    const wordsToggle = document.querySelector('.toggle:nth-child(3) input[type="checkbox"]');
    const generateBtn = document.querySelector('.main-btn');
    const inputBox = document.querySelector('.input-box');
   
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
           
            // Call callback with r entropy data
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
        console.log(config)
        let customEntropy;

        randomScratch((randomNumber) => { 
            // Aqui você recebe o valor final
            customEntropy = randomNumber;
            console.log("Dentro do callback:", customEntropy);
            // Exemplo: enviar para o backend
            fetch(`http://localhost:5001/generate?lan=${config.lang}&words=${config.words}&entropy=${encodeURIComponent(customEntropy[0])}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Resultado do backend:", data);
                    generateBtn.disabled = false;
                    generateBtn.textContent = "Generate";
                });


            });

    });
});

