<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260518215447 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE demande_reservation ADD admin_note TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE demande_reservation ADD internal_contacted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE demande_reservation ADD internal_confirmed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE demande_reservation ADD internal_refused_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE demande_reservation ADD internal_passed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE demande_reservation DROP admin_note');
        $this->addSql('ALTER TABLE demande_reservation DROP internal_contacted_at');
        $this->addSql('ALTER TABLE demande_reservation DROP internal_confirmed_at');
        $this->addSql('ALTER TABLE demande_reservation DROP internal_refused_at');
        $this->addSql('ALTER TABLE demande_reservation DROP internal_passed_at');
    }
}
