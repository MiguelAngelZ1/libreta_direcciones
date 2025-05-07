#!/bin/bash
# auto_commit.sh
# Este script monitorea el directorio actual recursivamente.
# Se asegura de ejecutar las operaciones Git de forma exclusiva mediante flock,
# y añade pausas para esperar a que se liberen los lock files.

BRANCH="main"
LOCKFILE="/tmp/auto_commit.lock"

echo "Iniciando el monitor de auto-commits para el branch $BRANCH..."

while inotifywait -r -e modify,create,delete .; do
  (
    # Intenta adquirir el lock de forma exclusiva; si ya está ocupado, salta el ciclo.
    flock -n 200 || { echo "Otro proceso está ejecutándose. Se saltará este ciclo."; exit 1; }
    
    # Si existen archivos lock, espera hasta que se liberen.
    while [ -f .git/index.lock ] || [ -f .git/refs/remotes/origin/HEAD.lock ]; do
      echo "Esperando a que se liberen los archivos de lock..."
      sleep 2
    done

    # Pausa adicional antes de iniciar las operaciones Git para amortiguar eventos rápidos.
    sleep 2

    git add -A

    # Solo se efectúa el commit si hay cambios pendientes
    if ! git diff-index --quiet HEAD --; then
        git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
        # Actualiza la rama local integrando cambios remotos (rebase)
        git pull --rebase
        # Realiza el push forzado al branch especificado
        git push --force origin $BRANCH
        echo "Commit realizado y push enviado al branch $BRANCH"
        # Pausa tras el push para garantizar que se liberen los locks 
        sleep 2
    fi
  ) 200>"$LOCKFILE"
done
