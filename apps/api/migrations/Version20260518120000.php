<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * PR2 admin auth — rename admin_user → app_user, add firstName/lastName/avatarColor.
 *
 * Notes :
 *  - Table renommée en `app_user` (et non `user`) car `user` est réservé en PostgreSQL.
 *  - Les rôles existants (ROLE_ADMIN) restent valides : ROLE_ADMIN hérite de
 *    ROLE_MANAGER → ROLE_STAFF via role_hierarchy dans security.yaml.
 */
final class Version20260518120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename admin_user to app_user + add firstName, lastName, avatarColor (PR2 admin auth).';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE admin_user RENAME TO app_user');
        $this->addSql('ALTER INDEX uniq_ad8a54a9e7927c74 RENAME TO uniq_app_user_email');
        $this->addSql('ALTER TABLE app_user ADD COLUMN first_name VARCHAR(80) DEFAULT NULL');
        $this->addSql('ALTER TABLE app_user ADD COLUMN last_name VARCHAR(80) DEFAULT NULL');
        $this->addSql('ALTER TABLE app_user ADD COLUMN avatar_color VARCHAR(120) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE app_user DROP COLUMN avatar_color');
        $this->addSql('ALTER TABLE app_user DROP COLUMN last_name');
        $this->addSql('ALTER TABLE app_user DROP COLUMN first_name');
        $this->addSql('ALTER INDEX uniq_app_user_email RENAME TO uniq_ad8a54a9e7927c74');
        $this->addSql('ALTER TABLE app_user RENAME TO admin_user');
    }
}
