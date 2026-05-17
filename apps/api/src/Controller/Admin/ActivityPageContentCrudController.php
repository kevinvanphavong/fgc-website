<?php

namespace App\Controller\Admin;

use App\Entity\ActivityPageContent;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ArrayField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class ActivityPageContentCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ActivityPageContent::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Page activité')
            ->setEntityLabelInPlural('Pages activités')
            ->setDefaultSort(['slug' => 'ASC']);
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::DELETE);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('slug')->hideOnForm();
        yield TextField::new('image', 'Image (chemin)');
        yield TextField::new('imageAlt', 'Alt image');
        yield TextField::new('inlinePriceAmount', 'Prix inline')->hideOnIndex();
        yield TextField::new('inlinePriceDescription', 'Description prix')->hideOnIndex();
        yield ArrayField::new('features', 'Caractéristiques');
        yield TextareaField::new('priceCards', 'Cartes tarifs (JSON)')
            ->hideOnIndex()
            ->setHelp('JSON array de cartes tarif. Ex: [{"title":"1 partie","price":"7,50€"}]');
        yield TextField::new('pricingEyebrow', 'Sur-titre tarifs')->hideOnIndex();
        yield TextField::new('pricingTitle', 'Titre tarifs')->hideOnIndex();
        yield TextareaField::new('pricingLead', 'Intro tarifs')->hideOnIndex();
    }
}
