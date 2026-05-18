<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Crée un super-admin si aucun n'existe avec l'email cible.
 * Idempotent : `doctrine:fixtures:load --append` ne duplique pas.
 *
 * Les credentials sont lues dans des vars d'env (cf. .env.example / .env.local).
 * Ne JAMAIS commiter de mot de passe en clair dans .env (versionné).
 */
class UserFixture extends Fixture implements FixtureGroupInterface
{
    public function __construct(private UserPasswordHasherInterface $hasher) {}

    public static function getGroups(): array
    {
        return ['users'];
    }

    public function load(ObjectManager $manager): void
    {
        $email = $_ENV['ADMIN_INITIAL_EMAIL'] ?? null;
        $password = $_ENV['ADMIN_INITIAL_PASSWORD'] ?? null;

        if (!$email || !$password) {
            throw new \RuntimeException(
                'UserFixture: ADMIN_INITIAL_EMAIL et ADMIN_INITIAL_PASSWORD doivent '
                . 'être définis (cf. apps/api/.env.local).'
            );
        }

        $user = $manager->getRepository(User::class)->findOneBy(['email' => $email]);
        $isNew = false;
        if (!$user) {
            $user = new User();
            $user->setEmail($email);
            $user->setRoles([User::ROLE_ADMIN]);
            $user->setPassword($this->hasher->hashPassword($user, $password));
            $isNew = true;
        }

        // Backfill metadata (firstName/lastName/avatarColor) si manquante — idempotent.
        $firstName = $_ENV['ADMIN_INITIAL_FIRST_NAME'] ?? null;
        $lastName = $_ENV['ADMIN_INITIAL_LAST_NAME'] ?? null;
        $avatarColor = $_ENV['ADMIN_INITIAL_AVATAR_COLOR']
            ?? 'linear-gradient(135deg,#FF2D87,#5E2DB8)';

        if ($firstName !== null && $user->getFirstName() === null) {
            $user->setFirstName($firstName);
        }
        if ($lastName !== null && $user->getLastName() === null) {
            $user->setLastName($lastName);
        }
        if ($user->getAvatarColor() === null) {
            $user->setAvatarColor($avatarColor);
        }

        if ($isNew) {
            $manager->persist($user);
        }
        $manager->flush();
    }
}
