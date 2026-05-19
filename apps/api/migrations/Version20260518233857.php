<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260518233857 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE app_user ADD enabled BOOLEAN DEFAULT true NOT NULL');
        $this->addSql('ALTER TABLE app_user ADD reset_token VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE app_user ADD reset_token_expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE app_user ADD last_login_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        // `created_at` nullable d'abord pour ne pas casser les rangs existants,
        // puis backfill `NOW()` partout, puis on bascule en NOT NULL.
        $this->addSql('ALTER TABLE app_user ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql("UPDATE app_user SET created_at = NOW() WHERE created_at IS NULL");
        $this->addSql('ALTER TABLE app_user ALTER COLUMN created_at SET NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_88BDF3E9D7C8DC19 ON app_user (reset_token)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_88BDF3E9D7C8DC19');
        $this->addSql('ALTER TABLE app_user DROP enabled');
        $this->addSql('ALTER TABLE app_user DROP reset_token');
        $this->addSql('ALTER TABLE app_user DROP reset_token_expires_at');
        $this->addSql('ALTER TABLE app_user DROP last_login_at');
        $this->addSql('ALTER TABLE app_user DROP created_at');
    }
}
