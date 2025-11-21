#!/bin/bash

# Script de déploiement simple - Prototype Courrier
# Port: 3388

cd /opt/prototype_courrier

# Mettre à jour le code
git pull origin main

# Ouvrir le port 3388 dans le pare-feu (si ufw est installé)
if command -v ufw &> /dev/null; then
    echo "🔓 Ouverture du port 3388 dans le pare-feu..."
    sudo ufw allow 3388/tcp
    sudo ufw reload
fi

# Reconstruire et lancer
docker compose up -d --build

# Vérifier que ça tourne
docker compose ps

# Voir les logs
docker compose logs -f courrier-proto

