#!/bin/bash
echo "Viewing $1 as 24 chunk hex"
cat $1 | hexdump -v -e '24/1 "%02x " "\n"'
