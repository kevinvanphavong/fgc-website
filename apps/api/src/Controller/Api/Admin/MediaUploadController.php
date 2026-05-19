<?php

namespace App\Controller\Api\Admin;

use App\Entity\User;
use App\Enum\MediaTag;
use App\Service\MediaUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Upload média via multipart/form-data — controller dédié pour simplifier
 * la gestion du multipart (cf. prompt § "Si bloqué"). Le reste des
 * opérations Media est sur ApiResource (GET/PATCH/DELETE).
 */
class MediaUploadController extends AbstractController
{
    #[Route('/api/admin/medias', name: 'api_admin_medias_upload', methods: ['POST'])]
    #[IsGranted('ROLE_STAFF')]
    public function upload(
        Request $request,
        MediaUploader $uploader,
        EntityManagerInterface $em,
    ): JsonResponse {
        $file = $request->files->get('file');
        if (!$file) {
            return new JsonResponse(['error' => 'Champ `file` manquant (multipart/form-data).'], 400);
        }

        $rawTag = (string) $request->request->get('tag', MediaTag::Global->value);
        $tag = MediaTag::tryFrom($rawTag);
        if ($tag === null) {
            return new JsonResponse([
                'error' => sprintf('Tag invalide. Valeurs : %s.', implode(', ', MediaTag::values())),
            ], 422);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        $uploadedBy = $user instanceof User ? $user : null;

        $media = $uploader->upload($file, $tag, $uploadedBy);
        $em->persist($media);
        $em->flush();

        return new JsonResponse([
            'id' => $media->getId(),
            'filename' => $media->getFilename(),
            'originalName' => $media->getOriginalName(),
            'url' => $media->getUrl(),
            'mimeType' => $media->getMimeType(),
            'sizeBytes' => $media->getSizeBytes(),
            'width' => $media->getWidth(),
            'height' => $media->getHeight(),
            'tag' => $media->getTag()->value,
            'createdAt' => $media->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ], 201);
    }
}
