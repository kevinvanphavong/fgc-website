<?php

namespace App\Controller\Admin;

use App\Entity\ResaCard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ArrayField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class ResaCardCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ResaCard::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Formule réservation')
            ->setEntityLabelInPlural('Formules réservation')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('key', 'Clé');
        yield TextField::new('rank', 'Rang');
        yield TextField::new('audience', 'Public');
        yield TextField::new('price', 'Prix');
        yield TextField::new('pitch', 'Accroche')->hideOnIndex();
        yield ArrayField::new('features', 'Inclus');
        yield TextareaField::new('keyPoint', 'Point clé')->hideOnIndex();
        yield BooleanField::new('featured', 'Mis en avant');
        yield IntegerField::new('position');
    }
}
