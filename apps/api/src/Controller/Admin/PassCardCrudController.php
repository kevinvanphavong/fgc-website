<?php

namespace App\Controller\Admin;

use App\Entity\PassCard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ArrayField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class PassCardCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return PassCard::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Pass')
            ->setEntityLabelInPlural('Pass')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('key', 'Clé');
        yield TextField::new('name', 'Nom');
        yield TextField::new('price', 'Prix');
        yield ArrayField::new('features', 'Inclus');
        yield TextField::new('separatePrice', 'Prix séparé');
        yield TextField::new('savings', 'Économie');
        yield BooleanField::new('featured', 'Mis en avant');
        yield IntegerField::new('position');
    }
}
