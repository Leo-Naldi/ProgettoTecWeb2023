import { Notify } from 'quasar'

export function showPositive (msg) {
  Notify.create({
    position:'top',
    type: 'positive',
    message: msg
  })
}
export function showNegative (msg) {
  Notify.create({
    position:'top',
    type: 'negative',
    message: msg
  })
}

export function getPostsWithHashtag(data, tag){
    return data.filter((obj) => obj.content.text.includes(tag));
}


