// Header Guard: prevents multiple inclusion
#ifndef bip39_H
#define bip39_H

// Maximum length of a word in the wordlist
#define MAX_WORD_LENGTH 16

#include <stdint.h>
#include <stddef.h>


// Functions prototypes for BIP-39 implementation


// Valid if entropy size is correct(128, 160, 192, 224, 256)
int valid_entropy_bits(uint16_t entropy_bits);

// Convert entropy bits to number of bytes
uint8_t entropy_bytes(uint16_t entropy_bits); 

// Get number of check bits
uint8_t checksum_bits(uint16_t entropy_bits); 

// Total bits = (entropy + checksum)
uint16_t total_bits(uint16_t entropy_bits);

// Calculate total number of mnemonic words
uint16_t total_words(uint16_t entropy_bits);

// Load the BIP-39 wordlist into memory
void load_wordlist(const char *filename, char words[2048][MAX_WORD_LENGTH]);

// Generate random entropy
void generate_entropy(uint8_t *entropy, uint8_t len);

#endif