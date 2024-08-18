// eslint-disable-next-line import/no-unused-modules
export default function ImageLoader({ src, width, quality }) {
    if (src.startsWith('/')) src = `https://compute.toys${src}`;
    const params = [`width:${width}`];
    if (quality) params.push(`quality:${quality}`);
    return `https://imgproxy.compute.toys/insecure/${params.join('/')}/plain/${src}`;
}
