#!/bin/zsh
cat /etc/*-release
echo "Git version  = $(git --version)"
echo "Node version = $(node --version)"
echo "Npm version  = $(npm --version)"
# update theme
sed -i '/^ZSH_THEME/c\ZSH_THEME="agnoster"' ~/.zshrc
