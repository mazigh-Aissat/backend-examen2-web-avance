export default function paginate(page, size) {
    const offset = page ? Number(page) : 0  // page
    const limit = size ? Number(size) : 10
    return { limit, offset }
}