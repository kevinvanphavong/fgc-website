<?php

namespace App\Controller\Admin;

use App\Entity\Offer;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class OfferCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Offer::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Offre')
            ->setEntityLabelInPlural('Offres accueil')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('key', 'Clé');
        yield TextField::new('image', 'Image (chemin)');
        yield TextField::new('title', 'Titre');
        yield TextField::new('badge', 'Badge');
        yield ChoiceField::new('badgeVariant', 'Couleur badge')
            ->setChoices([
                'Jaune' => 'yellow',
                'Rose' => 'pink',
                'Cyan' => 'cyan',
                'Violet' => 'purple',
            ]);
        yield TextField::new('href', 'Lien');
        yield IntegerField::new('position');
    }
}
