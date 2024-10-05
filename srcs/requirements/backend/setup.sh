#!/bin/bash

apt update  -y
apt install  python3  -y
apt install  python3-pip -y
mkdir /app
pip3 install -r /tmp/requirements.txt  
