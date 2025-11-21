# Guide de déploiement sur OVH - Port 3388

## Prérequis
- Serveur OVH avec accès SSH
- Git installé

## Étapes de déploiement

### 1. Connexion au serveur OVH
```bash
ssh votre-utilisateur@votre-serveur-ovh.com
```

### 2. Installation de Docker et Docker Compose

#### Installation de Docker
```bash
# Mettre à jour les paquets
sudo apt update

# Installer les dépendances
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le dépôt Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Démarrer Docker
sudo systemctl start docker
sudo systemctl enable docker

# Ajouter l'utilisateur au groupe docker (pour éviter d'utiliser sudo)
sudo usermod -aG docker $USER
# Note: Vous devrez vous déconnecter et reconnecter pour que cela prenne effet
```

#### Installation de Docker Compose
```bash
# Installer Docker Compose v2 (recommandé)
sudo apt install -y docker-compose-plugin

# Ou installer Docker Compose v1 (ancienne version)
sudo apt install -y docker-compose

# Vérifier l'installation
docker --version
docker compose version
# ou
docker-compose --version
```

**Note:** Si vous utilisez Docker Compose v2 (plugin), utilisez `docker compose` au lieu de `docker-compose`.

### 3. Cloner le dépôt GitHub
```bash
cd /chemin/vers/votre/dossier
git clone https://github.com/shadjava2/prototype_courrier.git
cd prototype_courrier
```

### 4. Construire et lancer avec Docker Compose

**Si vous utilisez Docker Compose v2 (plugin):**
```bash
docker compose up -d --build
```

**Si vous utilisez Docker Compose v1:**
```bash
docker-compose up -d --build
```

### 5. Vérifier que l'application fonctionne

**Avec Docker Compose v2:**
```bash
docker compose ps
curl http://localhost:3388
```

**Avec Docker Compose v1:**
```bash
docker-compose ps
curl http://localhost:3388
```

### 6. Configuration du pare-feu (si nécessaire)
Assurez-vous que le port 3388 est ouvert dans le pare-feu OVH :
```bash
# Exemple avec ufw (si installé)
sudo ufw allow 3388/tcp
```

### 7. Configuration du reverse proxy (optionnel - si vous utilisez Nginx/Apache)
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

### 8. Mise à jour de l'application
Pour mettre à jour l'application après des modifications sur GitHub :

**Avec Docker Compose v2:**
```bash
cd /opt/prototype_courrier
git pull origin main
docker compose down
docker compose up -d --build
```

**Avec Docker Compose v1:**
```bash
cd /opt/prototype_courrier
git pull origin main
docker-compose down
docker-compose up -d --build
```

## Commandes utiles

### Voir les logs

**Avec Docker Compose v2:**
```bash
docker compose logs -f
```

**Avec Docker Compose v1:**
```bash
docker-compose logs -f
```

### Arrêter l'application

**Avec Docker Compose v2:**
```bash
docker compose down
```

**Avec Docker Compose v1:**
```bash
docker-compose down
```

### Redémarrer l'application

**Avec Docker Compose v2:**
```bash
docker compose restart
```

**Avec Docker Compose v1:**
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

