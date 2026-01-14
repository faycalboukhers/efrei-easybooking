# Plan de Test Complet - EasyBooking

## 1. Introduction

### 1.1 Objectif
Ce document décrit le plan de test complet pour l'application EasyBooking, une plateforme de réservation de salles. Les tests couvrent les aspects fonctionnels, non-fonctionnels, de performance et de sécurité.

### 1.2 Portée
- Tests unitaires des composants backend et frontend
- Tests d'intégration des flux métiers complets
- Tests de performance et de charge
- Tests de sécurité (OWASP Top 10)

### 1.3 Environnement de test
- **Backend**: Node.js v22.11.0, Express.js, SQLite
- **Frontend**: React avec Vite
- **Framework de test**: Jest, Supertest, Artillery
- **Base de données**: SQLite (mode mémoire pour tests)

---

## 2. Stratégie de Test

### 2.1 Types de tests

#### A. Tests Unitaires (Minimum 10 tests)
Tests des fonctionnalités individuelles et isolées.

**Objectifs**:
- Valider chaque composant indépendamment
- Assurer la fiabilité des fonctions critiques
- Couverture de code > 70%

**Outils**: Jest, Supertest

#### B. Tests d'Intégration (Minimum 10 tests)
Tests des flux métiers complets et interactions entre composants.

**Objectifs**:
- Valider les parcours utilisateurs de bout en bout
- Tester les interactions entre modules
- Vérifier la cohérence des données

**Outils**: Jest, Supertest

#### C. Tests de Performance (Minimum 10 tests)
Tests de temps de réponse et de charge.

**Objectifs**:
- Temps de réponse < 2s pour les opérations critiques
- Supporter 100+ utilisateurs simultanés
- Identifier les goulots d'étranglement

**Outils**: Jest (pour temps de réponse), Artillery (pour tests de charge)

#### D. Tests de Sécurité (Minimum 10 tests)
Tests basés sur les vulnérabilités OWASP Top 10.

**Objectifs**:
- Prévenir les injections SQL
- Protéger contre les attaques XSS
- Sécuriser l'authentification et les sessions
- Valider les autorisations

**Outils**: Jest, Supertest, tests manuels

---

## 3. Cas de Test Détaillés

### 3.1 Tests Unitaires

| ID | Description | Données d'entrée | Résultat attendu | Priorité |
|----|-------------|------------------|------------------|----------|
| UT-01 | Inscription avec données valides | username, email valide, password ≥ 6 caractères | Status 201, token JWT généré | Haute |
| UT-02 | Inscription avec email invalide | email sans @ | Status 400, message d'erreur | Haute |
| UT-03 | Inscription avec mot de passe court | password < 6 caractères | Status 400, erreur de validation | Haute |
| UT-04 | Connexion avec identifiants valides | email et password corrects | Status 200, token JWT | Haute |
| UT-05 | Connexion avec identifiants invalides | email ou password incorrect | Status 401, pas de token | Haute |
| UT-06 | Récupération de toutes les chambres | Token valide | Status 200, liste de chambres | Moyenne |
| UT-07 | Récupération d'une chambre par ID | Token valide, ID existant | Status 200, détails chambre | Moyenne |
| UT-08 | Vérification de disponibilité | Token, date, heure début/fin | Status 200, booléen disponibilité | Haute |
| UT-09 | Création de réservation valide | Token, roomId, date, heures | Status 201, booking créé | Haute |
| UT-10 | Annulation de réservation | Token, bookingId propre à l'utilisateur | Status 200, confirmation | Moyenne |

### 3.2 Tests d'Intégration

| ID | Description | Scénario | Résultat attendu | Priorité |
|----|-------------|----------|------------------|----------|
| IT-01 | Flux complet d'inscription | Signup → Token stocké → Redirection | Utilisateur authentifié | Haute |
| IT-02 | Flux de connexion | Login → Token → Accès aux ressources | Accès autorisé | Haute |
| IT-03 | Parcours de réservation complet | Signup → Login → Liste chambres → Vérif dispo → Booking → Confirmation | Réservation créée et visible | Haute |
| IT-04 | Prévention de double réservation | Booking slot → Tentative re-booking même slot | Erreur 409, booking refusé | Haute |
| IT-05 | Réservation slot différent même chambre | Booking slot 1 → Booking slot 2 | Les deux réservations acceptées | Moyenne |
| IT-06 | Annulation et re-réservation | Créer booking → Annuler → Re-réserver | Succès à chaque étape | Moyenne |
| IT-07 | Consultation historique réservations | Créer plusieurs bookings → GET my-bookings | Liste complète des réservations | Moyenne |
| IT-08 | Filtrage des chambres | GET rooms avec filters (capacity) | Chambres filtrées correctement | Basse |
| IT-09 | Accès sans authentification | Tenter GET /rooms sans token | Status 401, accès refusé | Haute |
| IT-10 | Multi-utilisateurs simultanés | 2 users bookent chambres différentes | Les deux bookings réussissent | Moyenne |

### 3.3 Tests de Performance

| ID | Description | Métrique | Seuil acceptable | Priorité |
|----|-------------|----------|------------------|----------|
| PT-01 | Temps de réponse signup | Durée totale | < 2000 ms | Haute |
| PT-02 | Temps de réponse login | Durée totale | < 1000 ms | Haute |
| PT-03 | Temps de réponse liste chambres | Durée totale | < 500 ms | Haute |
| PT-04 | Temps vérification disponibilité | Durée totale | < 500 ms | Haute |
| PT-05 | Temps création booking | Durée totale | < 1000 ms | Haute |
| PT-06 | Requêtes concurrentes chambres | 50 requêtes simultanées | < 5000 ms total | Moyenne |
| PT-07 | Bookings en parallèle | 10 bookings simultanés | < 3000 ms total | Moyenne |
| PT-08 | Récupération historique | GET my-bookings avec 10+ bookings | < 500 ms | Moyenne |
| PT-09 | Filtrage avec charge | Filtres sur 100+ requêtes | < 500 ms par requête | Basse |
| PT-10 | Flux complet utilisateur | Signup → Rooms → Check → Book → History | < 5000 ms total | Haute |

### 3.4 Tests de Sécurité

| ID | Description | Type de vulnérabilité | Test | Résultat attendu | Priorité |
|----|-------------|----------------------|------|------------------|----------|
| ST-01 | SQL Injection login | A03 - Injection | Tentative `' OR '1'='1` | Login échoue, pas de token | Critique |
| ST-02 | SQL Injection signup | A03 - Injection | Username avec `'; DROP TABLE` | Requête échoue ou username échappé | Critique |
| ST-03 | XSS dans username | A03 - Injection | `<script>alert('XSS')</script>` | Input échappé/sanitisé | Critique |
| ST-04 | Accès sans authentification | A01 - Broken Access Control | GET /rooms sans token | Status 401 | Critique |
| ST-05 | Token JWT invalide | A02 - Cryptographic Failures | Token modifié/invalide | Status 403 | Critique |
| ST-06 | Mot de passe faible | A07 - Identification Failures | Password < 6 caractères | Rejet avec erreur | Haute |
| ST-07 | Email invalide | A04 - Insecure Design | Email sans format valide | Rejet avec erreur | Haute |
| ST-08 | Manipulation booking autre user | A01 - Broken Access Control | User B annule booking de User A | Status 404, opération refusée | Critique |
| ST-09 | Brute force login | A07 - Identification Failures | 10+ tentatives échouées | Tous échouent, pas de lock (à améliorer) | Haute |
| ST-10 | CSRF protection | A01 - Broken Access Control | Requête sans Content-Type JSON | Acceptée si valide | Moyenne |
| ST-11 | Information disclosure | A01 - Security Misconfiguration | Login échoué | Message générique | Haute |
| ST-12 | Authorization bypass | A01 - Broken Access Control | Accéder aux bookings d'autrui | Seuls propres bookings visibles | Critique |
| ST-13 | Input validation temps | A04 - Insecure Design | Time format invalide (25:99) | Status 400 | Haute |
| ST-14 | Room ID négatif | A04 - Insecure Design | roomId = -1 | Status 404 | Moyenne |
| ST-15 | Query parameter injection | A03 - Injection | Paramètre malveillant | Requête échoue ou ignorée | Haute |
| ST-16 | Session fixation | A07 - Identification Failures | Comparer tokens signup vs login | Tokens différents | Haute |
| ST-17 | Sensitive data exposure | A02 - Cryptographic Failures | Erreur serveur | Pas de détails internes | Haute |
| ST-18 | CORS validation | A05 - Security Misconfiguration | Origin localhost:3000 | Headers CORS présents | Moyenne |
| ST-19 | Security headers | A05 - Security Misconfiguration | Vérifier headers réponse | Content-Type correct | Basse |
| ST-20 | Mass assignment | A04 - Insecure Design | Signup avec role: 'admin' | Champ role ignoré | Haute |

---

## 4. Critères d'Acceptation

### 4.1 Couverture de code
- Couverture minimale: 70%
- Couverture cible: 85%

### 4.2 Taux de réussite
- Tests unitaires: 100%
- Tests d'intégration: 100%
- Tests de performance: ≥ 90%
- Tests de sécurité: 100%

### 4.3 Performance
- 95% des requêtes < temps seuil
- Pas de memory leaks
- Stabilité sous charge

---

## 5. Environnement et Données de Test

### 5.1 Données de test
- **Utilisateurs**: Générés dynamiquement avec timestamps uniques
- **Chambres**: 5 chambres pré-créées dans la base de données
- **Réservations**: Créées pendant les tests, nettoyées après

### 5.2 Configuration
- Base de données en mémoire (SQLite :memory:)
- Variables d'environnement de test
- Isolation entre tests

---

## 6. Planning d'Exécution

### Phase 1: Tests Unitaires
- Durée: Développement et tests
- Automatisation: CI/CD

### Phase 2: Tests d'Intégration
- Durée: Après tests unitaires
- Dépendances: Backend + routes fonctionnels

### Phase 3: Tests de Performance
- Durée: Après validation fonctionnelle
- Outils: Artillery pour load testing

### Phase 4: Tests de Sécurité
- Durée: En continu
- Revue: Analyse OWASP Top 10

---

## 7. Outils et Technologies

- **Jest**: Framework de test JavaScript
- **Supertest**: Tests HTTP pour Express
- **Artillery**: Tests de charge et performance
- **SQLite**: Base de données de test en mémoire
- **GitHub Actions**: CI/CD (recommandé)

---

## 8. Livrables

1. ✅ Code source avec tests automatisés
2. ✅ Plan de test (ce document)
3. 📋 Fiche de tests avec résultats d'exécution
4. 📊 Rapport de synthèse qualité
5. 🔗 Lien Git du projet

---

## 9. Commandes d'Exécution

```bash
# Backend tests
cd backend
npm test                    # Tous les tests
npm test -- --coverage      # Avec couverture
npm test -- unit           # Tests unitaires seulement
npm test -- integration    # Tests d'intégration seulement

# Performance tests
artillery run __tests__/performance/load-testing.yml

# Frontend tests (à implémenter)
cd frontend
npm test
```

---

## 10. Risques et Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Tests flaky (non déterministes) | Moyen | Moyenne | Isolation tests, timestamps uniques |
| Base de données partagée | Élevé | Faible | SQLite en mémoire par test |
| Tokens expirés pendant tests | Faible | Faible | Regénération automatique |
| Charge insuffisante testée | Moyen | Moyenne | Artillery avec phases progressives |

---

**Date de création**: 14 janvier 2026
**Version**: 1.0
**Auteur**: Équipe EasyBooking