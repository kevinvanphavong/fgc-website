<?php

namespace App\Controller\Admin;

use App\Entity\VipFeature;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class VipFeatureCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return VipFeature::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Avantage VIP')
            ->setEntityLabelInPlural('Avantages VIP')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('icon', 'Icône (emoji)');
        yield TextField::new('label', 'Libellé');
        yield IntegerField::new('position');
    }
}
