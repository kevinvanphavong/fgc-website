<?php

namespace App\Controller\Admin;

use App\Entity\DaySchedule;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class DayScheduleCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return DaySchedule::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Jour')
            ->setEntityLabelInPlural('Horaires')
            ->setDefaultSort(['position' => 'ASC']);
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::DELETE);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield TextField::new('key', 'Clé')->hideOnForm();
        yield TextField::new('label', 'Jour');
        yield TextField::new('hours', 'Horaires');
        yield IntegerField::new('jsDay', 'JS Day (0=dim)');
        yield IntegerField::new('position');
    }
}
