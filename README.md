# Cat Wallet
#### Video Demo:  <https://www.youtube.com/watch?v=HCy602CcF1Q>
#### Description:

## Overview
*To be used in the future in a crypto wallet

Cat Wallet is a mnemonic phrase (seed phrase) generator based on the BIP39 standard. The main goal is to create a secure recovery phrase for cryptocurrency wallets by combining:

- **User-provided entropy** (random mouse movements on the web interface captured by the `randomScratch` function).
- **System entropy** (randomness from `/dev/urandom` on Unix systems).
- **Secure hashing** with SHA-256.

Combining these factors ensures mnemonic phrases are more resistant to prediction attacks, providing greater security for private keys.  
The project is implemented in **C**, **Python (Flask)**, and **JavaScript**, following a modern frontend/backend architecture with an interactive web interface.

---

## Project Structure

### 1. Backend (C and Flask)

#### C (Csrc)
Implements the core logic for BIP39 mnemonic generation.

**Main components:**

- `bip39.h / bip39.c`: functions to validate entropy, calculate checksum, split into 11-bit chunks, and map words from the wordlist.
- `sha256.h / sha256.c`: implements SHA-256 hashing using OpenSSL.
- `main.c`: integrates user entropy with system randomness, generates the hash, and converts it into a mnemonic phrase.
- `wordlist/`: contains BIP39 wordlists in Portuguese (`br.txt`) and English (`en.txt`) with 2048 words each.
- `Makefile(/csrc)`: automates compilation of the C project and creates the executable `btc-wallet-c`.
- `Makefile(/crypto-wallet)`: automates compilation of the Python and C.

**C Flow:**

1. Receives entropy size (128 or 256 bits) and language (`-en` or `-br`).
2. Generates system entropy (`/dev/urandom`).
3. Hashes the user's mouse movement JSON using SHA-256.
4. Combines system entropy and user hash via XOR.
5. Converts the result into a mnemonic phrase using the chosen wordlist.
6. Prints the phrase to stdout to be read by the Python backend.

#### Python (Flask, Pysrc)
`app.py` serves as the REST API for the web application.

**Main functions:**

- Receives GET requests at `/generate` with parameters:
  - `lan` → language (`en` or `br`)
  - `words` → entropy size (128 or 256)
  - `entropy` → JSON of mouse movements
- Calls the C executable (`btc-wallet-c`) with the provided parameters.
- Returns JSON containing the mnemonic phrase, language, and number of words.

---

### 2. Frontend (Web)
Developed in **HTML**, **CSS**, and **JavaScript**.

**Main features:**

- Visual interface with cat (`cat.png`).
- Controls to select language and number of words.
- **Generate mnemonic** button to start the process.
- Captures user entropy through mouse movements:
  - Temporary interface (`scratch-container`) shows instructions and a progress bar.
  - Movements are converted into JSON and sent to the backend.
- Displays the generated mnemonic phrase in real-time and allows copying to clipboard.
- Styled with responsive CSS, ensuring usability on smaller screens (mobile).

---

## General Project Flow

1. User accesses the web page.
2. Selects language and number of words.
3. Moves the mouse to generate additional entropy.
4. Frontend sends JSON of movements to the backend.

**Backend:**

- Receives JSON and parameters.
- Ensures the correct wordlist and calls the C executable.
- C executable generates the mnemonic phrase combining entropies and hash.
- Backend returns JSON with the phrase.
- Frontend displays the phrase on the screen and allows copying.

---

## Technical and Innovative Aspects

- **Security:** combines user and system entropy with SHA-256 to generate unpredictable seeds.
- **Multi-language:** C for mnemonic generation, Python/Flask for API, JavaScript/HTML/CSS for the interface.
- **Responsiveness:** CSS adapts to mobile devices.
- **Interactive UX:** progress bar and visual instructions for user entropy collection.

---

## Conclusion
Cat Wallet is a robust, secure, and interactive project applying knowledge of:

- C programming (bit manipulation, entropy, hashing)
- Web development with Flask and JavaScript
- Good responsive frontend practices
- Backend/frontend integration via API


**Use of AI:**

- Organization and structuring of the project  
- Test implementation  
- Error checking, review, and correction  
- Support in refactoring complex code segments  
- Translation and adaptation of code/comments into multiple languages  
- Assistance in integrating different languages and frameworks  