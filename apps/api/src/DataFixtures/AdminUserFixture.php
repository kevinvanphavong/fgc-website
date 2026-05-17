<?php

namespace App\DataFixtures;

use App\Entity\AdminUser;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AdminUserFixture extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $hasher) {}

    public function load(ObjectManager $manager): void
    {
        $admin = new AdminUser();
        $admin->setEmail('admin@familygamescenter.fr');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->hasher->hashPassword($admin, 'FGC-Admin-2026!'));

        $manager->persist($admin);
        $manager->flush();
    }
}
