#!/bin/bash
# auto_commit.sh
# Este script monitorea el directorio actual de forma recursiva.
# Cada vez que detecta un cambio (modificación, creación o eliminación de archivos),
# realiza los siguientes pasos:
# 1. Añade todos los cambios (git add -A).
# 2. Verifica si hay diferencias pendientes respecto del último commit.
# 3. Si hay cambios, crea un commit con un mensaje que incluye la fecha y hora.
# 4. Realiza un git pull --rebase para actualizar la rama local con los cambios remotos.
# 5. Finalmente, hace un git push --force-with-lease al branch definido.

BRANCH="main"
echo "Iniciando el monitor de auto-commits para el branch $BRANCH..."

while inotifywait -r -e modify,create,delete .; do
  git add -A
  # Solo se efectúa el commit si hay cambios pendientes
  if ! git diff-index --quiet HEAD --; then
      git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
      # Actualiza la rama local integrando los últimos cambios del remoto (rebase)
      git pull --rebase
      # Hace push al branch especificado usando --force-with-lease
      git push --force-with-lease origin $BRANCH
      echo "Commit realizado y push enviado al branch $BRANCH"
  fi
  
done
