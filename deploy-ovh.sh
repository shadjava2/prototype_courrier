#!/bin/bash

# Script de déploiement pour OVH - Prototype Courrier
# Port: 3388

set -e

echo "=========================================="
echo "Déploiement Prototype Courrier sur OVH"
echo "=========================================="
echo ""

# Configuration
REPO_URL="https://github.com/shadjava2/prototype_courrier.git"
APP_DIR="/opt/prototype_courrier"
PORT=3388

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installation..."
    sudo apt update
    sudo apt install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Installation..."
    sudo apt install -y docker-compose
fi

# Créer le répertoire si nécessaire
if [ ! -d "$APP_DIR" ]; then
    echo "📁 Création du répertoire $APP_DIR..."
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
fi

# Aller dans le répertoire
cd $APP_DIR

# Cloner ou mettre à jour le dépôt
if [ -d ".git" ]; then
    echo "🔄 Mise à jour du code depuis GitHub..."
    git pull origin main
else
    echo "📥 Clonage du dépôt depuis GitHub..."
    git clone $REPO_URL .
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down 2>/dev/null || true

# Construire et démarrer
echo "🔨 Construction de l'image Docker..."
docker-compose build --no-cache

echo "🚀 Démarrage de l'application..."
docker-compose up -d

# Attendre que le conteneur démarre
echo "⏳ Attente du démarrage (10 secondes)..."
sleep 10

# Vérifier le statut
echo ""
echo "=========================================="
echo "Vérification du déploiement"
echo "=========================================="
docker-compose ps

echo ""
echo "📋 Logs récents:"
docker-compose logs --tail=20

echo ""
echo "=========================================="
echo "✅ Déploiement terminé!"
echo "=========================================="
echo ""
echo "🌐 L'application est accessible sur:"
echo "   http://$(hostname -I | awk '{print $1}'):$PORT"
echo "   ou"
echo "   http://localhost:$PORT"
echo ""
echo "📝 Commandes utiles:"
echo "   Voir les logs:     docker-compose logs -f"
echo "   Arrêter:          docker-compose down"
echo "   Redémarrer:       docker-compose restart"
echo "   Statut:           docker-compose ps"
echo ""

