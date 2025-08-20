#include <stdio.h>
#include "bip39.h"

int main(int argc, char *argv[])
{
    // Check arguments
    if (argc < 3)
    {
        printf("Use: %s <128|160|192|224|256> <-en|-br>\n", argv[0]);
        return 1;
    }

    // Convert the first argument (entropy size) to integer
    int entropy_bits = atoi(argv[1]);
    printf("Parsed entropy_bits: %d\n", valid_entropy_bits(entropy_bits));

    // Validate the entropy bits
    if (!valid_entropy_bits(entropy_bits))
    {
        printf("Please, enter the amoun of valid entropy bits.");
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

    // Print information about entropy and mnemonic parameters
    printf("%d bits|\n\n", entropy_bits);
    printf("Entropy Bytes: %d\n", entropy_bytes(entropy_bits));
    printf("Checksum bits: %d\n", checksum_bits(entropy_bits));
    printf("Total bits: %d\n", total_bits(entropy_bits));
    printf("Number of words: %d\n\n", total_words(entropy_bits));

    // Load the wordlist
    char wordlist[2048][MAX_WORD_LENGTH];
    load_wordlist(filename, wordlist);

    // Generate entropy
    uint8_t entropy[entropy_bytes(entropy_bits)];
    generate_entropy(entropy, entropy_bytes(entropy_bits));

    // Convert entropy to mnemonic phrase
    entropy_to_mnemonic(entropy, entropy_bits, wordlist);


    return 0;
}