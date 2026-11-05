# Add your travel photographs

The current collection contains ten user-supplied photographs. The `01`–`10` filename prefixes preserve their supplied order, with the red flower (`DSC_2614.JPG`) featured first.

1. Copy JPEG, PNG, WebP, AVIF, or TIFF images into this folder. Keep the images directly in this folder.
2. Keep your existing filenames. Files sort naturally; numeric prefixes such as `01.jpg` are optional if you want to choose their order.
3. Run `npm run photos`, then start or restart `npm run develop`. Production builds prepare the photographs automatically.

The first image is the featured photograph. Filenames control order only. The gallery and fullscreen viewer show no titles or filenames, so you do not need to name your photographs.

When this folder has at least one image, the gallery uses your images exclusively. Until then, it repeats one credited Unsplash demo image across 36 frames so you can try three batches.

The gallery reveals 12 photographs at a time, including the featured image. Scroll to the end of a batch, then select **More photographs**. The next batch becomes available after its last frame has entered the app viewport and finished its image request. Scrolling alone never adds another batch.

Only photographs inside the app viewport enter the download queue. The gallery admits at most two image requests at a time and pauses new requests while fullscreen is open. Quiet placeholders hold the image space until decoding finishes. Fullscreen keeps the previous image visible while the next image downloads, then dissolves between them. Both motion settings can remove the fades.

The preparation command rotates images using EXIF orientation and creates responsive WebP copies in `static/photography`. Those published copies omit EXIF metadata. The originals stay in this folder and are not served to visitors.

To replace or remove a photograph, update its file here and run `npm run photos` again. Changed content receives new image URLs. The command does not delete old generated files. `static/photography` is ignored by Git and can be regenerated from the originals.
