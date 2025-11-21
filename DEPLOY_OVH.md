# Guide de déploiement sur OVH - Port 3388

## Prérequis
- Serveur OVH avec accès SSH
- Docker et Docker Compose installés
- Git installé

## Étapes de déploiement

### 1. Connexion au serveur OVH
```bash
ssh votre-utilisateur@votre-serveur-ovh.com
```

### 2. Cloner le dépôt GitHub
```bash
cd /chemin/vers/votre/dossier
git clone https://github.com/shadjava2/prototype_courrier.git
cd prototype_courrier
```

### 3. Construire et lancer avec Docker Compose
```bash
docker-compose up -d --build
```

### 4. Vérifier que l'application fonctionne
```bash
docker-compose ps
curl http://localhost:3388
```

### 5. Configuration du pare-feu (si nécessaire)
Assurez-vous que le port 3388 est ouvert dans le pare-feu OVH :
```bash
# Exemple avec ufw (si installé)
sudo ufw allow 3388/tcp
```

### 6. Configuration du reverse proxy (optionnel - si vous utilisez Nginx/Apache)
Si vous souhaitez utiliser un domaine avec Nginx, ajoutez cette configuration :

#### Nginx
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3388;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Mise à jour de l'application
Pour mettre à jour l'application après des modifications sur GitHub :
```bash
cd /chemin/vers/prototype_courrier
git pull origin main
docker-compose down
docker-compose up -d --build
```

## Commandes utiles

### Voir les logs
```bash
docker-compose logs -f
```

### Arrêter l'application
```bash
docker-compose down
```

### Redémarrer l'application
```bash
docker-compose restart
```

### Accéder au conteneur
```bash
docker exec -it courrier-proto sh
```

## Variables d'environnement
Si vous avez besoin de variables d'environnement, créez un fichier `.env` à la racine du projet et ajoutez-les dans `docker-compose.yml` :

```yaml
services:
  courrier-proto:
    build: .
    container_name: courrier-proto
    ports:
      - "3388:3388"
    restart: unless-stopped
    env_file:
      - .env
```

## Accès à l'application
Une fois déployé, l'application sera accessible sur :
- `http://votre-ip-serveur:3388`
- Ou via votre domaine si vous avez configuré un reverse proxy

