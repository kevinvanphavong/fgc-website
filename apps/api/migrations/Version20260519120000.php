<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Espace client (PR11) :
 *   - app_user.phone + app_user.accept_newsletter
 *   - demande_reservation.user_id (nullable FK)
 *   - b2b_request.user_id (nullable FK)
 */
final class Version20260519120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'PR11 espace client : user.phone, user.accept_newsletter, demande_reservation.user_id, b2b_request.user_id';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE app_user ADD phone VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE app_user ADD accept_newsletter BOOLEAN DEFAULT false NOT NULL');

        $this->addSql('ALTER TABLE demande_reservation ADD user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE demande_reservation ADD CONSTRAINT FK_DEMANDE_RESA_USER FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE SET NULL NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_DEMANDE_RESA_USER ON demande_reservation (user_id)');

        $this->addSql('ALTER TABLE b2b_request ADD user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE b2b_request ADD CONSTRAINT FK_B2B_REQUEST_USER FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE SET NULL NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_B2B_REQUEST_USER ON b2b_request (user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE b2b_request DROP CONSTRAINT FK_B2B_REQUEST_USER');
        $this->addSql('DROP INDEX IDX_B2B_REQUEST_USER');
        $this->addSql('ALTER TABLE b2b_request DROP user_id');

        $this->addSql('ALTER TABLE demande_reservation DROP CONSTRAINT FK_DEMANDE_RESA_USER');
        $this->addSql('DROP INDEX IDX_DEMANDE_RESA_USER');
        $this->addSql('ALTER TABLE demande_reservation DROP user_id');

        $this->addSql('ALTER TABLE app_user DROP phone');
        $this->addSql('ALTER TABLE app_user DROP accept_newsletter');
    }
}
