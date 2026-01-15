# 📊 Tests de Performance avec Artillery

## 🎯 Vue d'ensemble

Ces tests de performance utilisent **Artillery** pour simuler des charges réalistes sur l'API EasyBooking.

---

## 🚀 Comment lancer les tests

### Prérequis

1. **Démarrez le serveur backend** dans un terminal:
   ```bash
   cd backend
   npm run dev
   ```

2. **Dans un autre terminal**, lancez les tests de performance:
   ```bash
   cd backend
   npm run test:load
   ```

### Alternative: Test rapide

Pour un test rapide (sans le fichier de config complet):
```bash
npm run test:load-quick
```

---

## 📋 Configuration des tests

### Fichier: `load-testing.yml`

**Phases de test:**
1. **Warm up** (60s) - 5 utilisateurs/seconde
2. **Ramp up** (120s) - 10 utilisateurs/seconde
3. **Spike** (60s) - 20 utilisateurs/seconde

**Total**: ~3 minutes de test, ~2,100 requêtes

### Scénarios testés

#### 1. Complete User Flow (50% du trafic)
- Inscription
- Récupération des chambres
- Création de réservation
- Consultation des réservations

#### 2. Browse Rooms (30% du trafic)
- Inscription
- Liste des chambres
- Filtrage par capacité
- Détails d'une chambre

#### 3. Login and Check Bookings (20% du trafic)
- Inscription
- Connexion
- Consultation des réservations

---

## 📊 Résultats attendus

### Métriques clés

Artillery affichera des statistiques comme:

```
Summary report @ 10:35:47(+0100)

Scenarios launched:  1050
Scenarios completed: 1050
Requests completed:  4200

Response time (msec):
  min: 12
  max: 456
  median: 45
  p95: 120
  p99: 180

Scenario counts:
  Complete User Flow: 525 (50%)
  Browse Rooms: 315 (30%)
  Login and Check Bookings: 210 (20%)

Codes:
  200: 3150 (75%)
  201: 1050 (25%)
```

### Objectifs de performance

| Métrique | Objectif | Status |
|----------|----------|--------|
| **P95 Response Time** | < 200ms | ✅ |
| **P99 Response Time** | < 500ms | ✅ |
| **Error Rate** | < 1% | ✅ |
| **Throughput** | > 50 req/s | ✅ |

---

## 🔧 Personnalisation des tests

### Modifier la charge

Éditez `load-testing.yml`, section `config.phases`:

```yaml
phases:
  - duration: 30      # Durée en secondes
    arrivalRate: 10   # Utilisateurs par seconde
    name: "Ma phase custom"
```

### Ajouter un scénario

```yaml
- name: "Mon scénario"
  weight: 10  # % du trafic
  flow:
    - get:
        url: "/api/mon-endpoint"
        headers:
          Authorization: "Bearer {{ authToken }}"
```

### Modifier la cible

Dans `load-testing.yml`:
```yaml
config:
  target: "http://localhost:5000"  # Changez l'URL ici
```

---

## 🐛 Troubleshooting

### Erreur: "ECONNREFUSED"
**Cause**: Le serveur backend n'est pas démarré

**Solution**:
```bash
cd backend
npm run dev
```

### Erreur: "command not found: artillery"
**Cause**: Artillery n'est pas installé

**Solution**:
```bash
npm install --save-dev artillery
```

### Trop d'erreurs 401/403
**Cause**: Les tokens JWT expirent pendant le test

**Solution**: Augmentez la durée de validité des tokens dans `backend/middleware/auth.js`

### Performance dégradée
**Cause**: Base de données SQLite file-based lente avec beaucoup de requêtes

**Solutions**:
- Utiliser SQLite en mode WAL: `PRAGMA journal_mode=WAL`
- Passer à PostgreSQL/MySQL pour production
- Augmenter les ressources du serveur

---

## 📈 Analyse des résultats

### Métriques importantes

1. **Response Time (p95/p99)**
   - p95 < 200ms = Excellent
   - p95 < 500ms = Bon
   - p95 > 1000ms = Problème

2. **Throughput (req/s)**
   - > 100 req/s = Excellent
   - 50-100 req/s = Bon
   - < 50 req/s = À améliorer

3. **Error Rate**
   - < 1% = Excellent
   - 1-5% = Acceptable
   - > 5% = Problème critique

4. **Scenarios Completed**
   - 100% = Parfait
   - > 95% = Bon
   - < 95% = Investigation nécessaire

### Génération de rapport HTML

```bash
artillery run --output report.json __tests__/performance/load-testing.yml
artillery report report.json
```

Ouvre `report.json.html` dans le navigateur pour un rapport visuel.

---

## 🎓 Pour le rapport

### Captures à inclure

1. **Commande lancée**
   ```bash
   npm run test:load
   ```

2. **Résultats en console**
   - Summary report complet
   - Response times
   - Scenario counts

3. **Rapport HTML** (optionnel mais recommandé)
   - Graphiques de charge
   - Timeline des requêtes
   - Distribution des réponses

### Sections du rapport

**Section "Tests de Performance":**
- Outil utilisé: Artillery 2.0
- Charge simulée: 2,100+ requêtes en 3 minutes
- Scénarios: 3 flux utilisateur réalistes
- Résultats:
  - P95 response time: XXXms
  - Throughput: XXX req/s
  - Error rate: X%
  - Taux de complétion: XX%

---

## 📚 Ressources

- [Documentation Artillery](https://www.artillery.io/docs)
- [Guide des métriques](https://www.artillery.io/docs/guides/guides/test-script-reference)
- [Exemples de scénarios](https://www.artillery.io/docs/guides/guides/http-reference)

---

## ✅ Checklist Tests de Performance

- [ ] Serveur backend démarré
- [ ] Artillery installé (`npm install --save-dev artillery`)
- [ ] Tests lancés (`npm run test:load`)
- [ ] Résultats enregistrés
- [ ] P95 < 500ms
- [ ] Error rate < 1%
- [ ] Tous les scénarios complétés
- [ ] Rapport généré (optionnel)
- [ ] Captures d'écran prises
- [ ] Résultats ajoutés au rapport

**Durée estimée**: 5-10 minutes (3 min de test + captures)
