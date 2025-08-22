#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "include/bip39.h"
#include "include/sha256.h"

int main(int argc, char *argv[])
{
    // Check arguments
    if (argc < 4)
    {
        printf("Use: %s <128|160|192|224|256> <-en|-br> <entropy_json>\n", argv[0]);
        return 1;
    }

    // Convert the first argument (entropy size) to integer
    int entropy_bits = atoi(argv[1]);
    // printf("Parsed entropy_bits: %d\n", valid_entropy_bits(entropy_bits));

    // Validate the entropy bits
    if (!valid_entropy_bits(entropy_bits))
    {
        printf("Please, enter the amount of valid entropy bits.");
        return 1;
    }

    // Select the wordlist based on the language
    const char *filename = NULL;
    if (strcmp(argv[2], "-en") == 0)
    {
        filename = "./wordlist/en.txt";
    }
    else if (strcmp(argv[2], "-br") == 0)
    {
        filename = "./wordlist/br.txt";
    }
    else
    {
        fprintf(stderr, "Invalid option. Use -en for English or -br for Portuguese.\n");
        return 1;
    }

    // Load the wordlist
    char wordlist[2048][MAX_WORD_LENGTH];
    load_wordlist(filename, wordlist);

    // Get the entropy JSON string
    const char *json_str = argv[3];
    
    // Calculate the required entropy size in bytes
    uint8_t entropy_size = entropy_bytes(entropy_bits);
    
    // Generate random entropy from /dev/urandom
    uint8_t random_entropy[entropy_size];
    generate_entropy(random_entropy, entropy_size);
    
    // Generate SHA-256 hash of the JSON string
    uint8_t json_hash[32];
    sha256((uint8_t *)json_str, strlen(json_str), json_hash);
    
    // Combine the JSON hash with random entropy using XOR
    uint8_t entropy[entropy_size];
    for (int i = 0; i < entropy_size; i++) {
        // Use modulo to cycle through the hash if needed
        entropy[i] = json_hash[i % 32] ^ random_entropy[i];
    }

    // Convert entropy to mnemonic phrase
    entropy_to_mnemonic(entropy, entropy_bits, wordlist);

    return 0;
}