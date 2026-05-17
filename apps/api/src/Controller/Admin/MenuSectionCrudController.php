<?php

namespace App\Controller\Admin;

use App\Entity\MenuSection;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class MenuSectionCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return MenuSection::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Section menu')
            ->setEntityLabelInPlural('Sections menu')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('key', 'Clé');
        yield TextField::new('eyebrow', 'Sur-titre');
        yield TextField::new('title', 'Titre');
        yield TextField::new('titleAccent', 'Titre accent');
        yield TextareaField::new('lead', 'Introduction')->hideOnIndex();
        yield IntegerField::new('position');
        yield CollectionField::new('columns', 'Catégories')
            ->useEntryCrudForm(MenuCategoryCrudController::class)
            ->hideOnIndex();
    }
}
