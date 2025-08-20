#include <stdint.h>
#include <stdio.h>
#include "bip39.h"

// Check if entropy bits are valid(128, 160, 192, 224, 256)
int valid_entropy_bits(uint16_t entropy_bits)
{
    return (entropy_bits == 128 ||entropy_bits == 160 ||
            entropy_bits == 192 ||entropy_bits == 224 ||
            entropy_bits == 256);
}

// Convert entropy bits into bytes(1byte=8bits)
uint8_t entropy_bytes(uint16_t entropy_bits)
{
    return (entropy_bits) / 8; 
}

// Calculate checksum bits
uint8_t checksum_bits(uint16_t entropy_bits)
{
    if (!valid_entropy_bits(entropy_bits))
    {
        return 0;
    }
    uint8_t checksum = (uint8_t)(entropy_bits / 32);
    return checksum;
}

// Total bits = entropy bits + checksum
uint16_t total_bits(uint16_t entropy_bits)
{
    if (!valid_entropy_bits(entropy_bits))
    {
        return 0;
    }
    uint16_t total = entropy_bits + checksum_bits(entropy_bits);
    return total;    
}

// Number of mnemonic words = total_bits/11
uint16_t total_words(uint16_t entropy_bits)
{
    if (!valid_entropy_bits(entropy_bits))
    {
        return 0;
    }
    return total_bits(entropy_bits) / 11;
}

// Load the BIP-39 wordlist into memory
void load_wordlist(const char *filename, char words[2048][MAX_WORD_LENGTH])
{
    FILE *fp = fopen(filename, "r");
    if (!fp)
    {
        perror("Failed to open worklist file");
        fprintf(stderr, "Error opening wordlist file\n");
        exit(1);
    }
    for (int i = 0; i < 2048; i++)
    {
        if (fscanf(fp, "%15s", words[i]) != 1)
        {
            fprintf(stderr, "Error reading word %d from %s\n", i, filename);
            fclose(fp);
            exit(1);
        }
    }
    fclose(fp);

}

//Generate random entropy using /dev/urandom
void generate_entropy(uint8_t *entropy, uint8_t len)
{
    FILE *fp = fopen("/dev/urandom", "rb");
    if (fp == NULL)
    {
        perror("fopen");
        exit(1);
    }
    
    size_t bytes_read = fread(entropy, 1, len, fp);
    if (bytes_read != len)
    {
        perror("fread");
        fclose(fp);
        exit(1);
    }

    fclose(fp);
}

// Get specific bit from byte array
int get_bit(uint8_t *data, int bit)
{
    int byte_index = bit / 8;
    int bit_index = 7 - (bit % 8);
    return (data[byte_index] >> bit_index) & 1;
}

//Convert entropy into mnemonic pharse using wordlist
void entropy_to_mnemonic(uint8_t *entropy, uint16_t entropy_bits, char wordlist[2048][MAX_WORD_LENGTH])
{
    // Debug message
    printf("Creating %d Mnemonics words\n", total_words(entropy_bits));

    uint8_t hash[32];
    const int len = entropy_bytes(entropy_bits);

    // Calculate SHA-256 hash for entropy
    sha256(entropy, len, hash);

    // Append first byte of hash as checksum
    uint8_t data[len + 1];
    memcpy(data, entropy, len);
    data[len] = hash[0];

    // Split into 11-bit chunks to map to words
    int total = total_bits(entropy_bits);
    for (int i = 0; i < total; i += 11)
    {
        int index = 0;
        for (int j = 0; j < 11; j++)
        {
            index <<= 1;
            index |= get_bit(data, i + j);
        }
        printf("%s", wordlist[index]);
    }
    printf("\n");
}