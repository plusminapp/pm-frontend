#!/bin/bash

echo "BankOverzicht.pdf opnieuw genereren starten"

pandoc BankOverzicht.md -o BankOverzicht.pdf \
  --pdf-engine=xelatex \
  -V lang=nl \
  -V mainfont='Trebuchet MS' \
  --include-in-header=./toc-naar-nieuwe-pagina.tex \
  --toc \
  --toc-depth=4 \
  -V geometry:margin=1in \
  -V 'geometry:left=3.5cm' \
  -V 'geometry:right=1.5cm' \
  -V 'geometry:top=1.5cm' \
  -V 'geometry:bottom=2cm' \
  --resource-path=.

echo "BankOverzicht.pdf opnieuw genereren afgerond"
