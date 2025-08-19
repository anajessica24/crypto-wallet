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
        fclose(fp);
        exit(1);
    }
    for (int i = 0; i < 2048; i++)
    {
        if (fscanf(fp, "15s", words[i]) != 1)
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
        fclose(fp);
        exit(1);
    }
    
}