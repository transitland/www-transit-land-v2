export const filterPosts = (posts) => {
  return posts.filter((s) => { return s.published === true })
    .map((s) => {
      const split = s.slug.split('-')
      let year = 0; let month = 0; let day = 0; let slug = ''
      if (split.length > 0) {
        year = split[0]
      }
      if (split.length > 1) {
        month = split[1]
      }
      if (split.length > 2) {
        day = split[2]
      }
      if (split.length > 3) {
        slug = split.slice(3).join('-')
      }
      return {
        title: s.title,
        path: s.path,
        body: s.body,
        year,
        month,
        day,
        slug
      }
    })
}
