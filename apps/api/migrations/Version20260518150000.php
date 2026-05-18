<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * PR4 — Add `active` flag to Offer (toggle home visibility from the new
 * Contenus admin without deleting/recreating the row).
 */
final class Version20260518150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add active flag to offer table.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE offer ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE offer DROP COLUMN active');
    }
}
