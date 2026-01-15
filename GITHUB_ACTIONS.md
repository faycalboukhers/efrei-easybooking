# 🔄 GitHub Actions - Pipeline CI/CD

## ✅ Ce qui a été configuré

Un pipeline CI/CD automatique a été ajouté au projet pour exécuter les tests à chaque push.

**Fichier**: `.github/workflows/ci.yml`

---

## 🚀 Comment ça fonctionne

### 1. Déclenchement Automatique

Le pipeline se lance automatiquement quand vous:
- Pushez du code sur la branche `main` ou `master`
- Créez une Pull Request vers `main` ou `master`

### 2. Jobs Exécutés

```
┌─────────────────────────────────────┐
│  GitHub Actions Pipeline            │
├─────────────────────────────────────┤
│                                     │
│  Job 1: Backend Tests               │
│  ├─ Install dependencies            │
│  ├─ Run 40 tests                    │
│  └─ Generate coverage report        │
│                                     │
│  Job 2: Frontend Tests              │
│  ├─ Install dependencies            │
│  ├─ Run 10 tests                    │
│  └─ Generate coverage report        │
│                                     │
│  Job 3: Summary                     │
│  └─ Display final results           │
│     (50/50 tests ✅)                │
│                                     │
└─────────────────────────────────────┘
```

### 3. Résultats Attendus

Quand tout fonctionne:
```
✅ Backend Tests - 40 passed
✅ Frontend Tests - 10 passed
✅ Tests Summary - All tests passed!
```

---

## 📋 Comment voir les résultats

### Sur GitHub

1. **Allez sur votre repository**: https://github.com/faycalboukhers/efrei-easybooking

2. **Cliquez sur l'onglet "Actions"** (en haut de la page)

3. **Vous verrez la liste de tous les workflows**:
   - ✅ = Tests réussis (vert)
   - ❌ = Tests échoués (rouge)
   - 🟡 = Tests en cours (jaune)

4. **Cliquez sur un workflow** pour voir les détails:
   - Logs de chaque job
   - Temps d'exécution
   - Erreurs éventuelles

### Badge de Statut

Ajoutez ce badge dans votre README.md pour afficher le statut:

```markdown
![CI Tests](https://github.com/faycalboukhers/efrei-easybooking/actions/workflows/ci.yml/badge.svg)
```

Résultat: ![CI Tests](https://github.com/faycalboukhers/efrei-easybooking/actions/workflows/ci.yml/badge.svg)

---

## 🛠️ Commandes pour pousser votre code

### Première fois

Si vous n'avez pas encore configuré le remote:

```bash
git remote add origin https://github.com/faycalboukhers/efrei-easybooking.git
git branch -M main
git add .
git commit -m "Add CI/CD pipeline and fix all tests"
git push -u origin main
```

### Fois suivantes

```bash
git add .
git commit -m "Your commit message"
git push
```

Le pipeline se lancera automatiquement après chaque push!

---

## 📊 Rapports de Couverture

Les rapports de couverture sont automatiquement générés et sauvegardés comme artifacts:

1. Allez dans l'onglet "Actions"
2. Cliquez sur un workflow terminé
3. En bas de la page, section "Artifacts"
4. Téléchargez:
   - `backend-coverage` (couverture backend)
   - `frontend-coverage` (couverture frontend)

Les artifacts sont conservés pendant 30 jours.

---

## ⚙️ Configuration du Pipeline

### Fichier: `.github/workflows/ci.yml`

**Technologies utilisées**:
- `actions/checkout@v4` - Clone le code
- `actions/setup-node@v4` - Installe Node.js 20
- `actions/upload-artifact@v4` - Sauvegarde les rapports

**Optimisations**:
- Cache npm pour accélérer l'installation
- Jobs parallèles (backend et frontend en même temps)
- Timeout automatique si tests trop longs

---

## 🔍 Résolution de Problèmes

### Si les tests échouent sur GitHub Actions

1. **Vérifiez les logs**:
   - Allez dans Actions → Workflow échoué
   - Cliquez sur le job en rouge
   - Lisez les logs d'erreur

2. **Tests qui passent localement mais pas sur GitHub**:
   - Vérifiez que toutes les dépendances sont dans `package.json`
   - Vérifiez les variables d'environnement
   - Assurez-vous que `NODE_ENV=test` est défini

3. **Re-lancer un workflow**:
   - Allez dans Actions
   - Cliquez sur le workflow échoué
   - Bouton "Re-run jobs" en haut à droite

---

## 📈 Métriques du Pipeline

| Métrique | Valeur |
|----------|--------|
| **Tests Backend** | 40 |
| **Tests Frontend** | 10 |
| **Total Tests** | 50 |
| **Couverture Backend** | 78.75% |
| **Temps Moyen** | ~1-2 minutes |
| **Node Version** | 20 |
| **OS** | Ubuntu Latest |

---

## ✨ Prochaines Étapes

Pour améliorer le pipeline (optionnel):

1. **Ajouter le déploiement automatique**:
   - Déployer sur Vercel/Netlify après tests réussis

2. **Ajouter des checks de qualité**:
   - ESLint
   - Prettier
   - Audit de sécurité npm

3. **Notifications**:
   - Email en cas d'échec
   - Slack notifications

4. **Tests de performance**:
   - Lighthouse CI
   - Bundle size checks

---

## 📞 Commandes Utiles

```bash
# Voir le statut des workflows
gh run list

# Voir les détails d'un workflow
gh run view

# Voir les logs
gh run view --log

# Re-lancer le dernier workflow
gh run rerun

# Télécharger les artifacts
gh run download
```

*Note: Nécessite GitHub CLI (`gh`) installé*

---

**Tout est prêt! Pushez votre code et les tests se lanceront automatiquement! 🚀**
