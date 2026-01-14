# Guide de Démarrage Rapide - EasyBooking

## Démarrage rapide en 3 étapes

### 1. Installation des dépendances

```bash
# Backend
cd backend
npm install

# Frontend (dans un nouveau terminal)
cd frontend
npm install
```

### 2. Lancer l'application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
L'application démarre sur `http://localhost:5173`

### 3. Tester l'application

Ouvrez votre navigateur sur `http://localhost:5173`

1. Cliquez sur "S'inscrire"
2. Créez un compte
3. Explorez les chambres disponibles
4. Réservez une salle
5. Consultez vos réservations

## Lancer les tests

```bash
cd backend
npm test
```

Pour les tests avec couverture:
```bash
npm test -- --coverage
```

## Accès rapide

- **Application**: http://localhost:5173
- **API Backend**: http://localhost:5000/api
- **Documentation**: README.md

## Chambres pré-créées

L'application contient 5 chambres de démonstration:
1. Salle Conférence A (50 personnes)
2. Salle Réunion B (10 personnes)
3. Salle Formation C (30 personnes)
4. Salle Executive D (8 personnes)
5. Espace Coworking E (20 personnes)

## Besoin d'aide?

Consultez le README.md pour plus de détails.