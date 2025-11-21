#!/bin/bash

echo "=== Diagnostic du déploiement ==="
echo ""

echo "1. Vérification de Docker..."
docker --version
echo ""

echo "2. Vérification de Docker Compose..."
docker-compose --version
echo ""

echo "3. Vérification des conteneurs..."
docker ps -a
echo ""

echo "4. Vérification des images..."
docker images | grep prototype
echo ""

echo "5. Vérification des logs du conteneur (si existant)..."
if [ "$(docker ps -aq -f name=courrier-proto)" ]; then
    echo "--- Logs du conteneur ---"
    docker logs courrier-proto --tail 50
else
    echo "Aucun conteneur trouvé"
fi
echo ""

echo "6. Vérification des ports en écoute..."
netstat -tuln | grep 3388 || ss -tuln | grep 3388
echo ""

echo "7. Test de connexion locale..."
curl -v http://localhost:3388 2>&1 | head -20
echo ""

echo "=== Fin du diagnostic ==="

