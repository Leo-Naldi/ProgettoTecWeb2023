export default function isImage(file) {
    return !!file.type.match('image/*')
}