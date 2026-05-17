<?php

namespace App\Controller\Admin;

use App\Entity\TarifPriceLine;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class TarifPriceLineCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return TarifPriceLine::class;
    }

    public function configureFields(string $pageName): iterable
    {
        yield TextField::new('label', 'Libellé');
        yield TextField::new('price', 'Prix');
        yield IntegerField::new('position');
    }
}
