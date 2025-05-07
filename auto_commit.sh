#!/bin/bash
# auto_commit.sh
# Este script monitorea el directorio actual de forma recursiva.
# Cada vez que detecta un cambio (modificación, creación o eliminación de archivos),
# realiza los siguientes pasos de forma exclusiva para evitar conflictos:
#
# 1. Añade todos los cambios (git add -A).
# 2. Verifica si hay diferencias pendientes respecto del último commit.
# 3. Si hay cambios, crea un commit con un mensaje que incluye la fecha y hora.
# 4. Realiza un git pull --rebase para actualizar la rama local con los cambios remotos.
# 5. Finalmente, hace un git push --force para forzar la actualización del branch definido.
#
# Se utiliza un archivo de bloqueo en /tmp para evitar que se solapen instancias del script.

BRANCH="main"
LOCKFILE="/tmp/auto_commit.lock"

echo "Iniciando el monitor de auto-commits para el branch $BRANCH..."

# Bucle de monitoreo de cambios (inotifywait se ejecuta de forma recursiva)
while inotifywait -r -e modify,create,delete .; do
  # Usamos flock para asegurarnos de que solo se ejecuta un ciclo a la vez.
  (
    # Esta opción bloquea el descriptor (200) de forma exclusiva y sale si ya está bloqueado.
    flock -n 200 || { echo "Otro proceso está ejecutándose. Se saltará este ciclo."; exit 1; }
    
    # Procedemos con las operaciones de Git
    git add -A

    # Solo se efectúa el commit si hay cambios pendientes
    if ! git diff-index --quiet HEAD --; then
        git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
        # Actualiza la rama local integrando los últimos cambios del remoto (rebase)
        git pull --rebase
        # Hace push forzado, ya que eres el único en el proyecto
        git push --force origin $BRANCH
        echo "Commit realizado y push enviado al branch $BRANCH"
    fi
  ) 200>"$LOCKFILE"
done
