<?php

namespace App\EventListener;

use App\Entity\Media;
use App\Service\MediaUploader;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;

/**
 * Quand une `Media` est supprimée via DELETE API Platform, on purge aussi
 * le fichier disque (sinon le `public/uploads/medias` s'encrasse).
 */
#[AsEntityListener(event: Events::postRemove, entity: Media::class)]
final class MediaDeleteListener
{
    public function __construct(
        private readonly MediaUploader $uploader,
    ) {
    }

    public function postRemove(Media $media): void
    {
        $this->uploader->deleteFile($media);
    }
}
