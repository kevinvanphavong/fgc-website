<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

if ($_SERVER['APP_DEBUG'] ?? false) {
    umask(0000);
}

/*
 * Setup DB de test une fois pour la suite : drop + create + schema + fixtures.
 * Skip si la variable d'env `FGC_TEST_DB_SKIP_SETUP=1` est posée
 * (utile pour re-runs locaux rapides quand on sait que la DB est fraîche,
 * ex. `FGC_TEST_DB_SKIP_SETUP=1 bin/phpunit tests/Controller/Api/Admin/...`).
 *
 * Si tu rajoutes des tests qui mutent persistemment des fixtures (rare),
 * unset cette variable.
 *
 * NB : passthru() avec --quiet pour limiter la sortie ; on récupère l'exit
 * code et on stoppe net si une étape échoue (sinon les tests partent sur
 * une DB inconsistante avec des messages d'erreur opaques).
 */
if (($_SERVER['FGC_TEST_DB_SKIP_SETUP'] ?? '0') !== '1') {
    $apiRoot = dirname(__DIR__);
    $console = $apiRoot.'/bin/console';
    $steps = [
        'doctrine:database:drop --force --if-exists --env=test --quiet',
        'doctrine:database:create --env=test --quiet',
        'doctrine:schema:create --env=test --quiet',
        'doctrine:fixtures:load --no-interaction --env=test --quiet',
    ];
    foreach ($steps as $cmd) {
        $exit = 0;
        passthru(sprintf('php %s %s 2>&1', escapeshellarg($console), $cmd), $exit);
        if ($exit !== 0) {
            fwrite(STDERR, sprintf("\n[bootstrap] Échec de l'étape : %s (exit=%d)\n", $cmd, $exit));
            exit(1);
        }
    }
}
