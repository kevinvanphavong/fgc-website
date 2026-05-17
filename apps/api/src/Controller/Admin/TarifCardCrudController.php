<?php

namespace App\Controller\Admin;

use App\Entity\TarifCard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class TarifCardCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return TarifCard::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Carte tarif')
            ->setEntityLabelInPlural('Cartes tarifs')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield ChoiceField::new('cardGroup', 'Groupe')
            ->setChoices(['Activités' => 'activites', 'Bar' => 'bar']);
        yield TextField::new('icon', 'Icône (emoji)');
        yield TextField::new('name', 'Nom');
        yield TextField::new('unit', 'Unité (ex: / partie)');
        yield TextareaField::new('note')->hideOnIndex();
        yield IntegerField::new('position');
        yield CollectionField::new('prices', 'Lignes de prix')
            ->useEntryCrudForm(TarifPriceLineCrudController::class)
            ->hideOnIndex();
    }
}
