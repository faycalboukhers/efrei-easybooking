### Backend
- **Runtime** : Node.js v22.11.0
- **Framework** : Express.js v5.2.1
- **Base de données** : SQLite v5.1.7
- **Authentification** : JWT (jsonwebtoken)
- **Hash** : bcryptjs
- **Testing** : Jest, Supertest, Artillery

### Frontend
- **Framework** : React v19
- **Build** : Vite v7
- **Router** : React Router DOM v7
- **HTTP Client** : Axios
- **Testing** : Vitest, Testing Library

cd backend
npm test                    # Tous les tests
npm test -- --coverage      # Avec couverture
npm test -- unit           # Tests unitaires seulement
npm test -- integration    # Tests d'intégration seulement
npm test -- unit
npm test -- performance
npm test -- security

artillery run __tests__/performance/load-testing.yml


backend/__tests__/
├── unit/
│   └── auth.test.js                    # Tests unitaires (40+ tests)
├── integration/
│   └── booking-flow.test.js            # Tests d'intégration (20+ tests)
├── performance/
│   ├── performance.test.js             # Tests de performance (10+ tests)
│   └── load-testing.yml                # Configuration Artillery
└── security/
    └── security.test.js                # Tests de sécurité (20+ tests)


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