<?php

namespace App\Controller\Admin;

use App\Entity\HebdoCard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ArrayField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class HebdoCardCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return HebdoCard::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Formule Hebdo')
            ->setEntityLabelInPlural('Formules Hebdo')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('key', 'Clé');
        yield TextField::new('tag');
        yield TextField::new('title', 'Titre');
        yield TextareaField::new('description')->hideOnIndex();
        yield ArrayField::new('bullets', 'Points clés');
        yield TextField::new('price', 'Prix');
        yield TextField::new('days', 'Jours');
        yield BooleanField::new('featured', 'Mis en avant');
        yield TextField::new('savings', 'Économie')->hideOnIndex();
        yield IntegerField::new('position');
    }
}
