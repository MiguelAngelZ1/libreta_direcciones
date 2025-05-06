#!/bin/bash
# auto_commit.sh
# Este script monitorea el directorio actual de forma recursiva y, cada vez que detecta
# cambios en archivos (creación, modificación o eliminación), ejecuta git add, commit y push automáticamente.

# Definimos el branch de trabajo (ajusta si usas otro branch distinto a main)
BRANCH="main"

# Salida informativa
echo "Iniciando el monitor de cambios para commits automáticos..."

# Bucle infinito que usa inotifywait para detectar eventos recursivamente
while inotifywait -r -e modify,create,delete .; do
  # Agrega todos los cambios
  git add -A
  # Verifica que haya cambios pendientes de commitear
  if ! git diff-index --quiet HEAD --; then
      # Realiza el commit con un mensaje que incluye la fecha y hora
      git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
      # Realiza el push en el branch definido
      git push origin $BRANCH
      echo "Commit realizado y push enviado al branch $BRANCH"
  fi
done
# Fin del script