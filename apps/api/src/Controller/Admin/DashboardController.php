<?php

namespace App\Controller\Admin;

use App\Entity\ActivityPageContent;
use App\Entity\AnnivCard;
use App\Entity\DaySchedule;
use App\Entity\HebdoCard;
use App\Entity\MenuCategory;
use App\Entity\MenuItem;
use App\Entity\MenuSection;
use App\Entity\Offer;
use App\Entity\PassCard;
use App\Entity\ResaCard;
use App\Entity\TarifCard;
use App\Entity\VipFeature;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem as EaMenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Config\UserMenu;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\User\UserInterface;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class DashboardController extends AbstractDashboardController
{
    public function index(): Response
    {
        $url = $this->container->get(AdminUrlGenerator::class)
            ->setController(TarifCardCrudController::class)
            ->generateUrl();

        return $this->redirect($url);
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('FGC Admin')
            ->setFaviconPath('favicon.ico')
            ->renderContentMaximized();
    }

    public function configureMenuItems(): iterable
    {
        yield EaMenuItem::section('Contenu du site');

        yield EaMenuItem::subMenu('Tarifs', 'fas fa-euro-sign')->setSubItems([
            EaMenuItem::linkToCrud('Cartes tarifs', 'fas fa-list', TarifCard::class),
        ]);

        yield EaMenuItem::linkToCrud('Horaires', 'fas fa-clock', DaySchedule::class);

        yield EaMenuItem::subMenu('Formules', 'fas fa-tags')->setSubItems([
            EaMenuItem::linkToCrud('Hebdo', 'fas fa-calendar-week', HebdoCard::class),
            EaMenuItem::linkToCrud('Pass', 'fas fa-ticket', PassCard::class),
            EaMenuItem::linkToCrud('Réservations', 'fas fa-bookmark', ResaCard::class),
            EaMenuItem::linkToCrud('Anniversaires', 'fas fa-birthday-cake', AnnivCard::class),
            EaMenuItem::linkToCrud('Avantages VIP', 'fas fa-star', VipFeature::class),
        ]);

        yield EaMenuItem::subMenu('Menu Bar & Snack', 'fas fa-utensils')->setSubItems([
            EaMenuItem::linkToCrud('Sections', 'fas fa-layer-group', MenuSection::class),
            EaMenuItem::linkToCrud('Catégories', 'fas fa-folder', MenuCategory::class),
            EaMenuItem::linkToCrud('Items', 'fas fa-hamburger', MenuItem::class),
        ]);

        yield EaMenuItem::linkToCrud('Activités', 'fas fa-gamepad', ActivityPageContent::class);
        yield EaMenuItem::linkToCrud('Offres accueil', 'fas fa-bullhorn', Offer::class);

        yield EaMenuItem::section('');
        yield EaMenuItem::linkToUrl('Voir le site', 'fas fa-external-link-alt', '/')->setLinkTarget('_blank');
        yield EaMenuItem::linkToLogout('Déconnexion', 'fas fa-sign-out-alt');
    }

    public function configureUserMenu(UserInterface $user): UserMenu
    {
        return parent::configureUserMenu($user)
            ->setName($user->getUserIdentifier());
    }
}
