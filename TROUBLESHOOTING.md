# Guide de Dépannage - EasyBooking

## Problème : Erreur 401 lors de la connexion

### Cause
L'erreur 401 (Unauthorized) signifie que les identifiants sont incorrects ou que l'utilisateur n'existe pas.

### Solutions

1. **Vérifiez que vous avez créé un compte d'abord**
   - Allez sur la page "S'inscrire" (http://localhost:5174/signup)
   - Créez un compte avec :
     - Un nom d'utilisateur
     - Un email valide (format: xxx@xxx.xxx)
     - Un mot de passe d'au moins 6 caractères

2. **Vérifiez vos identifiants**
   - Email : doit être exactement le même que lors de l'inscription
   - Mot de passe : sensible à la casse (majuscules/minuscules)

3. **Réinitialisez la base de données si nécessaire**
   ```bash
   # Arrêtez le serveur backend
   # Supprimez la base de données
   rm backend/database/easybooking.db
   # Redémarrez le serveur
   cd backend
   npm run dev
   ```

## Problème : Interface mal affichée

### Causes possibles
- Cache du navigateur
- Fichiers CSS non rechargés

### Solutions

1. **Rafraîchir la page**
   - Appuyez sur `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)

2. **Vider le cache**
   - Chrome : `Ctrl + Shift + Delete` → Vider le cache
   - Firefox : `Ctrl + Shift + Delete` → Vider le cache

3. **Vérifier que le frontend est bien démarré**
   ```bash
   cd frontend
   npm run dev
   ```
   L'application doit être sur http://localhost:5174

## Problème : Le backend ne démarre pas

### Erreurs possibles

**Erreur : Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Erreur : Cannot find module**
```bash
cd backend
rm -rf node_modules
npm install
```

**Erreur : Database error**
```bash
# Créer le dossier database s'il n'existe pas
mkdir backend/database
```

## Problème : Le frontend ne se connecte pas au backend

### Vérifications

1. **Le backend est démarré sur le port 5000**
   ```bash
   curl http://localhost:5000/api/rooms
   ```
   Devrait retourner une erreur 401 (normal, pas de token)

2. **CORS est activé**
   - Vérifiez que le backend a `app.use(cors())` dans server.js

3. **URL correcte dans le frontend**
   - Ouvrez `frontend/src/services/api.js`
   - Vérifiez que `API_URL = 'http://localhost:5000/api'`

## Procédure de test complète

### Étape 1 : Démarrer le backend
```bash
cd backend
npm run dev
```
Attendez : "Server running on port 5000"

### Étape 2 : Démarrer le frontend
```bash
cd frontend
npm run dev
```
Attendez : URL affichée (http://localhost:5174)

### Étape 3 : Créer un compte
1. Ouvrez http://localhost:5174
2. Cliquez sur "S'inscrire"
3. Remplissez :
   - Username : votrenom
   - Email : votre@email.com
   - Password : votremotdepasse (min 6 caractères)
4. Cliquez sur "Créer un compte"
5. Vous serez redirigé vers la liste des chambres

### Étape 4 : Se déconnecter et reconnecter
1. Cliquez sur "Déconnexion" en haut à droite
2. Cliquez sur "Connexion"
3. Utilisez les mêmes identifiants :
   - Email : votre@email.com
   - Password : votremotdepasse
4. Vous devriez être connecté avec succès

## Commandes utiles

### Vérifier les processus
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5174

# Linux/Mac
lsof -i :5000
lsof -i :5174
```

### Tester l'API directement
```bash
# Créer un compte
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}'

# Se connecter
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## Support

Si le problème persiste :
1. Vérifiez les logs du backend dans le terminal
2. Ouvrez la console du navigateur (F12) pour voir les erreurs frontend
3. Consultez le README.md pour plus d'informations