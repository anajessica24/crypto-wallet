#ifndef SHA256_H
#define SHA256_H

#include <stdio.h>
#include <string.h>  // For strlen
#include <openssl/sha.h>

void sha256(const uint8_t *data, size_t len, uint8_t *hash);

#endif