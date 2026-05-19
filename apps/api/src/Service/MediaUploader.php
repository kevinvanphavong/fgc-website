<?php

namespace App\Service;

use App\Entity\Media;
use App\Entity\User;
use App\Enum\MediaTag;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * Upload média sur disque local (V1). Structure pensée pour bascule S3 :
 * un seul service isole le chemin / l'URL.
 *
 * Path : public/uploads/medias/{yyyy}/{mm}/{slug}-{rand}.{ext}
 * URL  : /uploads/medias/{yyyy}/{mm}/{slug}-{rand}.{ext} (servable static)
 */
final class MediaUploader
{
    public const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo
    public const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    public const MAX_DIM = 4000;

    public function __construct(
        private readonly SluggerInterface $slugger,
        #[Autowire(param: 'kernel.project_dir')]
        private readonly string $projectDir,
    ) {
    }

    /**
     * @return Media persisté côté entité (pas flush — appelant flushe).
     */
    public function upload(UploadedFile $file, MediaTag $tag, ?User $uploadedBy = null): Media
    {
        if (!$file->isValid()) {
            throw new BadRequestHttpException('Upload invalide : '.$file->getErrorMessage());
        }

        if ($file->getSize() > self::MAX_BYTES) {
            throw new BadRequestHttpException(sprintf(
                'Fichier trop volumineux (%d Mo max).',
                (int) (self::MAX_BYTES / 1024 / 1024),
            ));
        }

        $mime = $file->getMimeType() ?? 'application/octet-stream';
        if (!in_array($mime, self::ALLOWED_MIMES, true)) {
            throw new BadRequestHttpException(sprintf(
                'Type de fichier non supporté (%s). Autorisés : %s.',
                $mime,
                implode(', ', self::ALLOWED_MIMES),
            ));
        }

        $width = null;
        $height = null;
        $imgInfo = @getimagesize($file->getPathname());
        if ($imgInfo !== false) {
            $width = $imgInfo[0];
            $height = $imgInfo[1];
            if ($width > self::MAX_DIM || $height > self::MAX_DIM) {
                throw new BadRequestHttpException(sprintf(
                    'Dimensions trop grandes (%dx%d). Max %dx%d.',
                    $width, $height, self::MAX_DIM, self::MAX_DIM,
                ));
            }
        }

        $original = $file->getClientOriginalName();
        $slug = $this->slugger->slug(pathinfo($original, PATHINFO_FILENAME))->lower();
        $ext = $file->guessExtension() ?: $file->getClientOriginalExtension();
        $unique = bin2hex(random_bytes(3));
        $filename = sprintf('%s-%s.%s', $slug, $unique, $ext);

        $now = new \DateTimeImmutable();
        $relativeDir = sprintf('uploads/medias/%s/%s', $now->format('Y'), $now->format('m'));
        $absoluteDir = $this->projectDir.'/public/'.$relativeDir;
        if (!is_dir($absoluteDir) && !mkdir($absoluteDir, 0755, true) && !is_dir($absoluteDir)) {
            throw new \RuntimeException(sprintf('Impossible de créer le répertoire %s.', $absoluteDir));
        }

        $file->move($absoluteDir, $filename);
        $diskPath = $absoluteDir.'/'.$filename;
        $url = '/'.$relativeDir.'/'.$filename;

        $media = (new Media())
            ->setFilename($filename)
            ->setOriginalName($original)
            ->setMimeType($mime)
            ->setSizeBytes((int) filesize($diskPath))
            ->setWidth($width)
            ->setHeight($height)
            ->setTag($tag)
            ->setUrl($url)
            ->setDiskPath($diskPath)
            ->setUploadedBy($uploadedBy);

        return $media;
    }

    /** Supprime physiquement le fichier disque (silencieux si absent). */
    public function deleteFile(Media $media): void
    {
        $path = $media->getDiskPath();
        if ($path !== '' && is_file($path)) {
            @unlink($path);
        }
    }
}
