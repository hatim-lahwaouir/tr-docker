#!/bin/sh

apk add openssl 

TLS_CONF_DIR=/TLS
mkdir -p $TLS_CONF_DIR

CRT_DIR=$TLS_CONF_DIR/CRT
PRIV_KEY_DIR=$TLS_CONF_DIR/PRIV_KEY
CSR_DIR=$TLS_CONF_DIR/CRS

PRIVKEY=private.key
CRS=crs.csr
CRT=crt.crt

mkdir -p $CRT_DIR $PRIV_KEY_DIR $CSR_DIR 
mkdir -p /app



echo "Creating private key "
openssl genrsa -out  "${PRIV_KEY_DIR}/${PRIVKEY}" 2048

echo "Creating the certificate signing request "

openssl req -key "${PRIV_KEY_DIR}/${PRIVKEY}" -new -out "${CSR_DIR}/${CRS}" -subj "/C=MR/ST=./L=./O=./OU=./CN=."


echo "Signing the certificate"

openssl x509 -signkey "${PRIV_KEY_DIR}/${PRIVKEY}" -in "${CSR_DIR}/${CRS}" -req -days 365 -out "${CRT_DIR}/${CRT}"
