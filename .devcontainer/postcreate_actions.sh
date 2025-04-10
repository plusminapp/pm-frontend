#!/bin/zsh
cat /etc/*-release
echo "Git version  = $(git --version)"
echo "Node version = $(node --version)" 
echo "Npm version  = $(npm --version)"
# update theme
sed -i '/^ZSH_THEME/c\ZSH_THEME="agnoster"' ~/.zshrc
# check of docker network npm_default bestaat. Nodig voor connect vanuit devcontainer met normale backend docker
docker network inspect npm_default >/dev/null 2>&1 || docker network create -d bridge npm_default