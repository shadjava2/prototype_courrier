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

### 6. Ouvrir le port 3388 dans le pare-feu
**IMPORTANT :** Vous devez ouvrir le port 3388 pour que l'application soit accessible :

```bash
# Avec ufw (pare-feu Ubuntu)
sudo ufw allow 3388/tcp
sudo ufw reload

# Vérifier que le port est ouvert
sudo ufw status | grep 3388
```

**Note :** Si vous utilisez un autre pare-feu ou le pare-feu OVH, configurez-le pour autoriser le port 3388.

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

## Dépannage

### Le conteneur ne démarre pas ou l'application n'est pas accessible

1. **Vérifier les logs du conteneur :**
```bash
docker-compose logs -f
# ou
docker logs courrier-proto
```

2. **Vérifier que le conteneur est en cours d'exécution :**
```bash
docker ps -a
```

3. **Vérifier que le build a réussi :**
```bash
docker-compose build --no-cache
docker-compose up -d
```

4. **Vérifier les ports :**
```bash
netstat -tuln | grep 3388
# ou
ss -tuln | grep 3388
```

5. **Redémarrer complètement :**
```bash
docker-compose down
docker-compose up -d --build
```

6. **Vérifier les erreurs de build :**
```bash
docker-compose build 2>&1 | tee build.log
```

7. **Entrer dans le conteneur pour diagnostiquer :**
```bash
docker exec -it courrier-proto sh
# Dans le conteneur :
ls -la
cat package.json
npm start
```

8. **Vérifier que le dossier .next existe :**
```bash
docker exec -it courrier-proto ls -la .next
```

### Erreurs courantes

- **"Cannot find module"** : Le build n'a pas réussi, vérifiez les logs de build
- **"Port already in use"** : Un autre service utilise le port 3388
- **"Permission denied"** : Problème de permissions Docker
- **"Connection refused"** : Le conteneur n'écoute pas sur le bon port ou n'est pas démarré

### Script de diagnostic

Un script de diagnostic est disponible dans le dépôt :
```bash
chmod +x troubleshoot.sh
./troubleshoot.sh
```

## Accès à l'application
Une fois déployé, l'application sera accessible sur :
- `http://votre-ip-serveur:3388`
- Ou via votre domaine si vous avez configuré un reverse proxy

