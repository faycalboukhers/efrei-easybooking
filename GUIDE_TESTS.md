# Guide des Tests - EasyBooking

## 📍 Où sont les fichiers de tests ?

```
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
```

**Total : 90+ tests automatisés**

---

## 🛠️ Outils Utilisés

| Outil | Utilisation | Commande |
|-------|-------------|----------|
| **Jest** | Framework de test JavaScript | `npm test` |
| **Supertest** | Tests API HTTP | Intégré dans Jest |
| **Artillery** | Tests de charge | `artillery run load-testing.yml` |
| **SQLite** | Base de données de test | En mémoire (`:memory:`) |

---

## 🧪 Ce que teste chaque fichier

### 1. Tests Unitaires (`unit/auth.test.js`)

**Quoi ?** Fonctions individuelles de l'API

**Tests :**
- ✅ Inscription avec données valides
- ✅ Validation format email
- ✅ Validation longueur mot de passe
- ✅ Connexion avec identifiants valides/invalides
- ✅ Récupération des chambres
- ✅ Filtrage par capacité
- ✅ Création de réservations
- ✅ Prévention double booking
- ✅ Annulation de réservations
- ✅ Gestion des erreurs

**Pourquoi ?** Vérifier que chaque fonction fait exactement ce qu'elle doit faire

---

### 2. Tests d'Intégration (`integration/booking-flow.test.js`)

**Quoi ?** Parcours utilisateur complets

**Tests :**
- ✅ Flux complet : Signup → Login → Browse → Book → Cancel
- ✅ Scénario multi-utilisateurs
- ✅ Gestion des conflits de réservation
- ✅ Validation des autorisations
- ✅ Cas limites et erreurs

**Pourquoi ?** Vérifier que tous les composants fonctionnent ensemble

**Exemple de flux testé :**
```
1. Créer un compte
2. Se connecter
3. Voir les chambres
4. Vérifier disponibilité
5. Réserver une chambre
6. Voir ses réservations
7. Annuler une réservation
```

---

### 3. Tests de Performance (`performance/performance.test.js`)

**Quoi ?** Temps de réponse et capacité de charge

**Tests :**
- ⚡ Signup < 2 secondes
- ⚡ Login < 1 seconde
- ⚡ Liste chambres < 500ms
- ⚡ Création booking < 1 seconde
- ⚡ 50 requêtes concurrentes < 5 secondes
- ⚡ Flux complet < 5 secondes

**Pourquoi ?** Garantir une application réactive

**Artillery (load-testing.yml) :**
- 10 users/sec pendant 60s (warm-up)
- 50 users/sec pendant 120s (sustained)
- 100 users/sec pendant 60s (peak)

---

### 4. Tests de Sécurité (`security/security.test.js`)

**Quoi ?** Vulnérabilités OWASP Top 10

**Tests :**

**Injection (4 tests)**
- 🛡️ SQL Injection dans login
- 🛡️ SQL Injection dans signup
- 🛡️ XSS dans username
- 🛡️ Query parameter injection

**Broken Access Control (4 tests)**
- 🛡️ Accès sans authentification
- 🛡️ Manipulation booking autre user
- 🛡️ CSRF protection
- 🛡️ Authorization bypass

**Cryptographic Failures (3 tests)**
- 🛡️ Token JWT invalide
- 🛡️ Session fixation
- 🛡️ Sensitive data exposure

**Insecure Design (4 tests)**
- 🛡️ Validation email
- 🛡️ Validation format temps
- 🛡️ Room ID négatif
- 🛡️ Mass assignment

**Security Misconfiguration (3 tests)**
- 🛡️ Information disclosure
- 🛡️ CORS validation
- 🛡️ Security headers

**Identification Failures (4 tests)**
- 🛡️ Mot de passe faible
- 🛡️ Brute force login
- 🛡️ Token expiration
- 🛡️ Multi-sessions

**Pourquoi ?** Protéger l'application contre les attaques

---

## 🚀 Comment lancer les tests

### Tous les tests
```bash
cd backend
npm test
```

### Avec couverture de code
```bash
npm test -- --coverage
```

### Tests spécifiques
```bash
# Unitaires uniquement
npm test -- unit

# Intégration uniquement
npm test -- integration

# Performance uniquement
npm test -- performance

# Sécurité uniquement
npm test -- security
```

### Tests de charge Artillery
```bash
artillery run __tests__/performance/load-testing.yml
```

---

## 📊 Résultats Attendus

### Jest
```
Test Suites: 4 passed, 4 total
Tests:       90+ passed, 90+ total
Time:        ~15-30 seconds
Coverage:    > 70%
```

### Artillery
```
Scenarios launched: 10,000+
Scenarios completed: 10,000+
Requests completed: 40,000+
Response time (p95): < 2000ms
Response time (p99): < 5000ms
Success rate: > 95%
```

---

## 📈 Couverture de Code

**Fichiers couverts :**
- `routes/auth.js` - Routes d'authentification
- `routes/rooms.js` - Routes des chambres
- `routes/bookings.js` - Routes des réservations
- `middleware/auth.js` - Middleware JWT

**Objectif :** > 70% de couverture

**Voir le rapport :**
```bash
npm test -- --coverage
open coverage/index.html
```

---

## 🎯 Points Clés

| Type | Nombre | Fichier | Temps |
|------|--------|---------|-------|
| Unitaires | 40+ | `unit/auth.test.js` | ~5s |
| Intégration | 20+ | `integration/booking-flow.test.js` | ~10s |
| Performance | 10+ | `performance/performance.test.js` | ~15s |
| Sécurité | 20+ | `security/security.test.js` | ~5s |
| **Total** | **90+** | **4 fichiers** | **~35s** |

---

## 🔍 Structure d'un Test

**Exemple simplifié :**
```javascript
// Test unitaire
test('should create user with valid data', async () => {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123'
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('token');
});
```

**Ce que ça fait :**
1. Envoie une requête POST à l'API
2. Vérifie le code de statut (201 = créé)
3. Vérifie que la réponse contient un token

---

## 📝 Configuration

**Jest** (`backend/jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['routes/**/*.js', 'middleware/**/*.js']
};
```

**Package.json scripts**
```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

---

## ✅ Checklist des Tests

- [ ] Tests unitaires passent (40+)
- [ ] Tests d'intégration passent (20+)
- [ ] Tests de performance passent (10+)
- [ ] Tests de sécurité passent (20+)
- [ ] Couverture de code > 70%
- [ ] Aucun test flaky (instable)
- [ ] Temps d'exécution < 1 minute

---

**C'est tout ! Les tests sont automatiques et prêts à l'emploi.** 🚀