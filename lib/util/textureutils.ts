import { Texture } from '../atoms/atoms';

const MAX_IMAGE_DIMENSION_PX = 8192;
// 30MB
const MAX_IMAGE_BYTE_SIZE = 30000000;

/**
 * Error message to display when an image can't be loaded, but we don't have enough
 * details to tell why
 */
const GENERIC_LOAD_ERROR = 'Could not load image. Check that it is a valid';

/**
 * Given a user-provided URL, check that:
 *
 * - Enforce the https protocol for compat
 * - Validate syntactical correctness
 * - Check that URL host is allowed
 * - Enforce max image size
 */
const validateTextureUrl = (url: string): Promise<string> => {
    const trimmed = url.trim();

    return new Promise((resolve, reject) => {
        // enforce https no matter the protocol provided
        const withHttps = !/^https:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;

        let urlObj: URL;
        try {
            urlObj = new URL(withHttps);
        } catch {
            throw 'Invalid URL';
        }

        fetch(urlObj)
            .then(fetched => {
                if (!fetched.ok) {
                    reject(
                        `Could not retrieve texture from remote source, status ${fetched.status}`
                    );
                    return;
                }

                fetched.arrayBuffer().then(imgBuffer => {
                    if (imgBuffer.byteLength > MAX_IMAGE_BYTE_SIZE) {
                        throw (
                            `File too large. ${(MAX_IMAGE_BYTE_SIZE / 1000000).toFixed(2)}` +
                            'MB is the maximum allowed size'
                        );
                    }

                    let img: HTMLImageElement = new Image();
                    img.addEventListener('load', () => {
                        if ('naturalHeight' in img) {
                            if (img.naturalHeight + img.naturalWidth === 0) {
                                reject(GENERIC_LOAD_ERROR);
                            } else if (img.naturalHeight > MAX_IMAGE_DIMENSION_PX) {
                                reject(`Maximum image height is ${MAX_IMAGE_DIMENSION_PX}px`);
                            } else if (img.naturalWidth > MAX_IMAGE_DIMENSION_PX) {
                                reject(`Maximum image width is ${MAX_IMAGE_DIMENSION_PX}px`);
                            } else {
                                resolve(urlObj.href);
                            }
                        }

                        reject(GENERIC_LOAD_ERROR);

                        // gc, just in case
                        setTimeout(() => {
                            img = null;
                        });
                    });

                    img.addEventListener('error', () => {
                        reject(GENERIC_LOAD_ERROR);
                        setTimeout(() => {
                            img = null;
                        });
                    });

                    img.src = urlObj.href;
                });
            })
            .catch(() => {
                reject(
                    'Failed to load image. If the URL is valid, the resource may not allow cross-origin fetching'
                );
            });
    });
};

/**
 * Given a user-provided URL, return a formed Texture
 */
export const getTextureFromProvidedUrl = async (url: string): Promise<Texture> => {
    const match = url.match(/^https:\/\/polyhaven.com\/a\/([\w_]+)$/);
    if (match) {
        const name = match[1];
        const response = await fetch(`https://api.polyhaven.com/files/${name}`);
        const data = await response.json();
        if (data.hdri) {
            const img = data.hdri['2k']?.hdr?.url;
            const thumb = data.tonemapped?.url;
            return { img, thumb, url };
        } else if (data.Diffuse) {
            const mapType = Object.keys(data)[0];
            const img = data[mapType]['1k']?.jpg?.url;
            return { img, url };
        } else {
            throw new Error('Unrecognised Poly Haven API response');
        }
    }
    return {
        img: await validateTextureUrl(url)
    };
};

const polyhaven_texture = (name: string, map = 'diff'): Texture => {
    return {
        img: `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/${name}/${name}_${map}_1k.jpg`,
        url: `https://polyhaven.com/a/${name}`
    };
};

const polyhaven_hdri = (name: string): Texture => {
    return {
        img: `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/${name}_2k.hdr`,
        thumb: `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${name}.jpg`,
        url: `https://polyhaven.com/a/${name}`
    };
};

export const defaultTextures: Texture[] = [
    polyhaven_texture('stone_brick_wall_001'),
    polyhaven_texture('wood_table_001'),
    polyhaven_texture('rusty_metal_02'),
    polyhaven_texture('rock_pitted_mossy'),
    polyhaven_texture('aerial_rocks_02'),
    polyhaven_texture('book_pattern', 'col2'),
    polyhaven_hdri('autumn_crossing'),
    polyhaven_hdri('dikhololo_night'),
    polyhaven_hdri('leadenhall_market'),
    polyhaven_hdri('music_hall_01'),
    polyhaven_hdri('spruit_sunrise'),
    polyhaven_hdri('vatican_road'),
    { img: './textures/blank.png' },
    {
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Regent_Street_Clay_Gregory.jpg/1920px-Regent_Street_Clay_Gregory.jpg'
    },
    { img: './textures/anim0.png' },
    { img: './textures/bayer0.png' },
    { img: 'https://raw.githubusercontent.com/otaviogood/shader_fontgen/master/codepage12.png' },
    polyhaven_texture('rocks_ground_01', 'disp'),
    { img: './textures/noise0.png' },
    { img: './textures/noise1.png' },
    { img: './textures/noise2.png' },
    { img: './textures/noise3.png' },
    { img: './textures/noise4.png' }
];
