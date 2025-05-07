#!/bin/bash
# auto_commit.sh
BRANCH="main"
echo "Ejecutando auto commit en el branch $BRANCH..."

# Agrega todos los cambios y comprueba si hay algo pendiente
git add -A
if ! git diff-index --quiet HEAD --; then
    git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
    git pull --rebase
    git push --force origin $BRANCH
    echo "Commit realizado y push enviado al branch $BRANCH"
else
    echo "No hay cambios pendientes."
fi
