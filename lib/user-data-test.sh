#!/bin/bash

cd ..
cd frontend/src/ 
sudo chmod -R 777 config/
cd config/ 
echo "export const API_BASE_URL = 'http://34.234.35.138:8888/api/';
export const BASE_URL = 'http://34.234.35.138:8888/';
export const DOWNLOAD_BASE_URL = 'http://34.234.35.138:download/';
export const ACCESS_TOKEN_NAME = 'x-auth-token';" > serverApiConfig.js 
cd.. 
cd.. 
sudo npm install
sudo npm run start &
cd /
cd var/lib/cloud/instances/*
mv user-data.txt user-data.sh
(crontab -l ; echo "0 9 * * 1-5 sudo sh user-data.sh") | crontab -