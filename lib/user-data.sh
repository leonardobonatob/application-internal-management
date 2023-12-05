#!/bin/bash

#Update all yum package repositories
yum update -y

#Install Apache Web Server
sudo yum install -y httpd.x86_64
sudo yum install unzip
sudo yum install aws-cli
#sudo yum install libcurl-devel openssl-devel libuuid-devel pulseaudio-libs-devel
sudo yum install https://rpm.nodesource.com/pub_16.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm -y
sudo yum install nodejs -y --setopt=nodesource-nodejs.module_hotfixes=1
sudo yum install gcc-c++ make
sudo yum install python-pip
#Start and Enable Apache Web Server
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
sudo systemctl start httpd.service
sudo systemctl enable httpd.service
#sudo systemctl start docker

#Adds our custom application
cd /var/www/html/
