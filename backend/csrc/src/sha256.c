#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <openssl/evp.h>
#include "../include/sha256.h"

void sha256(const uint8_t *data, size_t len, uint8_t *hash)
{
    // Creates a context for hash calculation
    EVP_MD_CTX *ctx = EVP_MD_CTX_new();
    if (ctx == NULL)
    {
        fprintf(stderr, "Error allocating memory for hash context.");
        return;
    }

    
    // Initialize the context with SHA-256
    if (EVP_DigestInit_ex(ctx, EVP_sha256(), NULL) != 1)
    {
        fprintf(stderr, "Error initializing hash context.");
        EVP_MD_CTX_free(ctx);
        return;
    }

    // Update the context with the input data
    if (EVP_DigestUpdate(ctx, data, len) != 1)
    {
        fprintf(stderr, "Error updating hash.");
        EVP_MD_CTX_free(ctx);
        return;
    }

    // Finalize the hash and store the result
    if (EVP_DigestFinal_ex(ctx, hash, NULL) != 1)
    {
        fprintf(stderr, "Error completing hash calculation.");
        EVP_MD_CTX_free(ctx);
        return;
    }

    EVP_MD_CTX_free(ctx);
}