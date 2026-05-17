<?php

namespace App\Controller\Admin;

use App\Entity\MenuCategory;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class MenuCategoryCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return MenuCategory::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Catégorie menu')
            ->setEntityLabelInPlural('Catégories menu')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('key', 'Clé');
        yield TextField::new('title', 'Titre');
        yield AssociationField::new('section', 'Section');
        yield IntegerField::new('position');
        yield CollectionField::new('items', 'Items')
            ->useEntryCrudForm(MenuItemCrudController::class)
            ->hideOnIndex();
    }
}
