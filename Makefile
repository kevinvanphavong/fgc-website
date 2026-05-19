# Raccourcis de dev FGC.
# Conventions :
#  - cibles préfixées `web-*` pour le frontend Next, `api-*` pour le backend Symfony.

.PHONY: test-api test-api-fast

# Suite PHPUnit complète de l'API (drop+create+seed DB de test à chaque run,
# cf. apps/api/tests/bootstrap.php). Objectif : < 30s en local et en CI.
test-api:
	@cd apps/api && bin/test-api

# Re-run rapide en supposant la DB de test déjà fraîche (pas de drop+seed).
# Utile pendant le dev TDD ; ne pas l'utiliser en CI.
test-api-fast:
	@cd apps/api && FGC_TEST_DB_SKIP_SETUP=1 bin/test-api
