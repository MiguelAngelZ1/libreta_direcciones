#!/bin/bash
BRANCH="main"
echo "Ejecutando auto commit en el branch $BRANCH..."

# Agrega todos los cambios
git add -A
echo "Archivos añadidos al staging."

# Verifica si hay cambios pendientes
if ! git diff-index --quiet HEAD --; then
    echo "Se detectaron cambios, procediendo con el commit..."
    git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
    git pull --rebase
    git push --force origin $BRANCH
    echo "Commit realizado y push enviado al branch $BRANCH"
else
    echo "No hay cambios pendientes, nada que commitear."
fi
