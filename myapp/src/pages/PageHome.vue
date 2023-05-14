<template>
    <q-page class="relative-position">
        <q-scroll-area class="absolute full-width full-height">
            <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
                <div class="col">
                    <q-input v-model="newQweetContent" class="new-qweet" placeholder="What's happening?" maxlength="280"
                        bottom-slots counter autogrow>
                        <template v-slot:before>
                            <q-avatar size="xl">
                                <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=80">
                            </q-avatar>
                        </template>
                    </q-input>
                </div>
                <div class="col col-shrink">
                    <q-btn @click="addNewQweet" :disable="!newQweetContent" class="q-mb-lg" color="primary" label="Qweet"
                        rounded unelevated no-caps />
                </div>
            </div>

            <q-separator class="divider" color="grey-2" size="10px" />

            <q-list separator>
                <transition-group appear enter-active-class="animated fadeIn slow"
                    leave-active-class="animated fadeOut slow">
                    <q-item v-for="qweet in qweets" :key="qweet.id" class="qweet q-py-md">
                        <q-item-section avatar top>
                            <q-avatar size="xl">
                                <img src="https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?s=80">
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label class="text-subtitle1">
                                <strong>User name</strong>
                            </q-item-label>
                            <q-item-label class="qweet-content text-body1">{{ qweet.content }}</q-item-label>
                            <div class="qweet-icons row justify-between q-mt-sm">
                                <q-btn color="grey" icon="far fa-comment" size="sm" flat round />
                                <q-btn color="grey" icon="fas fa-retweet" size="sm" flat round />
                                <q-btn @click="toggleLiked(qweet)" :color="qweet.liked ? 'pink' : 'grey'"
                                    :icon="qweet.liked ? 'fas fa-heart' : 'far fa-heart'" size="sm" flat round />
                                <q-btn @click="deleteQweet(qweet)" color="grey" icon="fas fa-trash" size="sm" flat round />
                            </div>
                        </q-item-section>
                    </q-item>
                </transition-group>
            </q-list>
        </q-scroll-area>
    </q-page>
</template>
  
<script>
import { formatDistance } from 'date-fns'

export default {
    name: 'PageHome',
    data() {
        return {
            newQweetContent: '',
            qweets: [
                // {
                //   id: 'ID1',
                //   content: 'dsgadgasdgsdgsdagd',
                //   date: 1611653238221,
                //   //TODO:
                // },
                // {
                //   id: 'ID2',
                //   content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat justo id viverra consequat. Integer feugiat lorem faucibus est ornare scelerisque. Donec tempus, nunc vitae semper sagittis, odio magna semper ipsum, et laoreet sapien mauris vitae arcu.',
                //   date: 1611653252444,
                //   //TODO:
                // },
            ]
        }
    },
    methods: {
        addNewQweet() {
            console.log("add new qweet")
        },
        deleteQweet(qweet) {
            console.log("delete qweet")
        },
        toggleLiked(qweet) {
            console.log("qweet liked")
        }
    },
    filters: {
        relativeDate(value) {
            return formatDistance(value, new Date())
        }
    },
}
</script>
  
<style lang="sass">
.new-qweet
    textarea    
        font-size: 19px
        line-height: 1.4 !important
.divider
    border-top: 1px solid
    border-bottom: 1px solid
    border-color: $grey-4
.qweet:not(:first-child)
    border-top: 1px solid rgba(0, 0, 0, 0.12)
.qweet-content
    white-space: pre-line
.qweet-icons
    margin-left: -5px
</style>
  